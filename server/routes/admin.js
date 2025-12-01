// server/routes/admin.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { supabaseAdmin } from "../supabaseClient.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import {
  sendEmailToMember,
  sendSmsToMember,
  normalizeItalianPhone,
} from "../services/notifications.js";
import { safeDecrypt, encrypt } from "../services/crypto.js";
import {
  createMemberFromForm,
  mapMemberRowDecrypted,
} from "../services/members.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isProd = process.env.NODE_ENV === "production";

// multer per leggere file dal form-data
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/admin/register
 * (da usare una volta via curl per creare l'admin)
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e password sono obbligatorie" });
    }

    const { data: existing, error: checkErr } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: "Errore controllo admin" });
    }

    if (existing) {
      return res.status(400).json({ message: "Admin già registrato" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from("admins")
      .insert({ email, password_hash: passwordHash })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Errore creazione admin" });
    }

    return res.json({ ok: true, admin: { id: data.id, email: data.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore creazione admin" });
  }
});

/**
 * POST /api/admin/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e password sono obbligatorie" });
    }

    const { data: admin, error } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !admin) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const token = jwt.sign({ sub: admin.id, email: admin.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore login" });
  }
});

/**
 * GET /api/admin/me
 */
router.get("/me", adminAuthMiddleware, (req, res) => {
  return res.json({
    id: req.admin.id,
    email: req.admin.email,
  });
});

/**
 * POST /api/admin/logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie("admin_token");
  return res.json({ ok: true });
});

/**
 * POST /api/admin/upload-document
 * Upload documento IDENTITÀ (fronte/retro) nel bucket privato "documents"
 * Usato dal MembershipForm pubblico (NIENTE adminAuth qui)
 */
router.post("/upload-document", upload.single("file"), async (req, res) => {
  try {
    console.log(">>> /api/admin/upload-document HIT", {
      date: new Date().toISOString(),
      origin: req.headers.origin,
      host: req.headers.host,
      path: req.body?.path,
      filePresent: !!req.file,
    });

    if (!req.file) {
      return res.status(400).json({ message: "Nessun file inviato" });
    }

    const file = req.file;
    const path = req.body.path; // es: "2025-11-30/uuid_front_nomefile.png"

    if (!path) {
      return res.status(400).json({ message: "Path mancante" });
    }

    // upload nel bucket privato
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("documents")
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadErr) {
      console.error("Errore upload storage:", uploadErr);

      if (
        uploadErr.statusCode === "409" ||
        uploadErr.statusCode === 409 ||
        uploadErr.message?.toLowerCase().includes("duplicate")
      ) {
        return res
          .status(409)
          .json({ message: "File già esistente per questo percorso" });
      }

      return res.status(500).json({ message: "Errore upload file" });
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    if (signErr) {
      console.error("Errore signedUrl:", signErr);
      return res
        .status(500)
        .json({ message: "Errore generazione URL documento" });
    }

    return res.json({
      ok: true,
      path,
      signedUrl: signed.signedUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore upload documento" });
  }
});

/**
 * POST /api/admin/members
 * Endpoint usato dal form pubblico di membership
 * (NESSUN adminAuth, ma potresti aggiungere rate-limit / captcha)
 */
router.post("/members", async (req, res) => {
  console.log(">>> HIT POST /api/admin/members", {
    date: new Date().toISOString(),
    body: req.body,
  });

  try {
    const member = await createMemberFromForm(req.body);
    return res.status(201).json({ ok: true, member });
  } catch (err) {
    console.error("POST /api/admin/members error", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      ok: false,
      message: err.message || "Errore creazione membro",
    });
  }
});

/**
 * GET /api/admin/members
 * Lista soci per la tab admin (dati già decriptati)
 */
router.get("/members", adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/members] error", error);
      return res
        .status(500)
        .json({ ok: false, message: "Errore lettura membri" });
    }

    const members = (data || []).map(mapMemberRowDecrypted);
    return res.json({ ok: true, members });
  } catch (err) {
    console.error("[GET /api/admin/members] unexpected", err);
    return res.status(500).json({ ok: false, message: "Errore imprevisto" });
  }
});

/**
 * GET /api/admin/members/:id
 * Dettaglio singolo socio (dati decriptati)
 */
router.get("/members/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      console.error("[GET /api/admin/members/:id] error", error);
      return res
        .status(404)
        .json({ ok: false, message: "Membro non trovato" });
    }

    const member = mapMemberRowDecrypted(data);
    return res.json({ ok: true, member });
  } catch (err) {
    console.error("[GET /api/admin/members/:id] unexpected", err);
    return res.status(500).json({ ok: false, message: "Errore imprevisto" });
  }
});

/**
 * GET /api/admin/members.xml
 * Export soci (con tutti i campi + URL documenti) in XML
 * Usa campi in chiaro se presenti, altrimenti prova a decriptare *_enc.
 */
router.get("/members.xml", adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Errore lettura membri" });
    }

    const rows = data || [];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<members>\n`;

    for (const m of rows) {
      // email
      let emailPlain = m.email ?? "";
      if (!emailPlain && m.email_enc) {
        emailPlain = safeDecrypt(m.email_enc, "");
      }

      // phone
      let phonePlain = m.phone ?? "";
      if (!phonePlain && m.phone_enc) {
        phonePlain = safeDecrypt(m.phone_enc, "");
      }

      // fiscal code
      let fiscalPlain = m.fiscal_code ?? "";
      if (!fiscalPlain && m.fiscal_code_enc) {
        fiscalPlain = safeDecrypt(m.fiscal_code_enc, "");
      }

      xml += `  <member>\n`;
      xml += `    <id>${m.id}</id>\n`;
      xml += `    <created_at>${m.created_at}</created_at>\n`;
      xml += `    <full_name>${m.full_name ?? ""}</full_name>\n`;
      xml += `    <email>${emailPlain}</email>\n`;
      xml += `    <phone>${phonePlain}</phone>\n`;
      xml += `    <date_of_birth>${m.date_of_birth ?? ""}</date_of_birth>\n`;
      xml += `    <birth_place>${m.birth_place ?? ""}</birth_place>\n`;
      xml += `    <fiscal_code>${fiscalPlain}</fiscal_code>\n`;
      xml += `    <city>${m.city ?? ""}</city>\n`;
      xml += `    <accept_privacy>${m.accept_privacy}</accept_privacy>\n`;
      xml += `    <accept_marketing>${m.accept_marketing}</accept_marketing>\n`;
      xml += `    <note>${m.note ?? ""}</note>\n`;
      xml += `    <source>${m.source ?? ""}</source>\n`;
      xml += `    <document_front_url>${m.document_front_url ?? ""}</document_front_url>\n`;
      xml += `    <document_back_url>${m.document_back_url ?? ""}</document_back_url>\n`;
      xml += `  </member>\n`;
    }

    xml += `</members>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore generazione XML" });
  }
});

/* ------------------------------------------------------------------
   CONTACT MESSAGES – cifrati
-------------------------------------------------------------------*/

/**
 * Helper: mappa una row di contact_messages in oggetto decriptato
 */
function mapContactRowDecrypted(m) {
  if (!m) return null;

  // name
  let namePlain = m.name ?? "";
  if (!namePlain && m.name_enc) {
    namePlain = safeDecrypt(m.name_enc, "");
  }

  // email
  let emailPlain = m.email ?? "";
  if (!emailPlain && m.email_enc) {
    emailPlain = safeDecrypt(m.email_enc, "");
  }

  // phone
  let phonePlain = m.phone ?? "";
  if (!phonePlain && m.phone_enc) {
    phonePlain = safeDecrypt(m.phone_enc, "");
  }

  // message
  let messagePlain = m.message ?? "";
  if (!messagePlain && m.message_enc) {
    messagePlain = safeDecrypt(m.message_enc, "");
  }

  return {
    id: m.id,
    created_at: m.created_at,
    name: namePlain,
    email: emailPlain,
    phone: phonePlain,
    message: messagePlain,
    source_page: m.source_page,
    handled: m.handled,
  };
}

/**
 * POST /api/contact
 * Form contatti pubblico: salva cifrando i dati nella tabella contact_messages
 */
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message, source_page } = req.body || {};

    if (!email || !message) {
      return res
        .status(400)
        .json({ ok: false, message: "Email e messaggio sono obbligatori" });
    }

    const nameClean = name?.trim() || "";
    const emailClean = email?.trim() || "";
    const phoneClean = phone?.trim() || "";
    const messageClean = message?.trim() || "";

    const insertPayload = {
      // in chiaro li lasciamo null per i nuovi record
      name: null,
      email: null,
      phone: null,
      message: null,

      // cifrati
      name_enc: nameClean ? encrypt(nameClean) : null,
      email_enc: encrypt(emailClean),
      phone_enc: phoneClean ? encrypt(phoneClean) : null,
      message_enc: encrypt(messageClean),

      source_page: source_page || "contact_section",
      handled: false,
    };

    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("[POST /api/contact] insert error", error);
      return res
        .status(500)
        .json({ ok: false, message: "Errore salvataggio messaggio" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/contact] unexpected", err);
    return res
      .status(500)
      .json({ ok: false, message: "Errore imprevisto invio messaggio" });
  }
});

/**
 * GET /api/admin/contact-messages
 * Lista messaggi contatti (dati decriptati) per tab admin
 */
router.get("/contact-messages", adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/contact-messages] error", error);
      return res.status(500).json({
        ok: false,
        message: "Errore lettura messaggi contatti",
      });
    }

    const messages = (data || []).map(mapContactRowDecrypted);
    return res.json({ ok: true, messages });
  } catch (err) {
    console.error("[GET /api/admin/contact-messages] unexpected", err);
    return res.status(500).json({ ok: false, message: "Errore imprevisto" });
  }
});

/* ------------------------------------------------------------------ */

function renderEmailTemplate({ member, title, event_date, message_email }) {
  const nome = member.full_name || "Socio";
  let body = message_email || "";

  body = body.replace(/{{\s*nome\s*}}/gi, nome);

  if (event_date) {
    const dataFormattata = new Date(event_date).toLocaleDateString("it-IT");
    body = body.replace(/{{\s*data_evento\s*}}/gi, dataFormattata);
  }

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #0f172a;">
      <h1 style="font-size:18px; color:#020617; margin-bottom: 8px;">${title}</h1>
      <p>Ciao ${nome},</p>
      <p>${body.replace(/\n/g, "<br/>")}</p>
      <p style="margin-top:16px; font-size:12px; color:#64748b;">
        Utopia · Ingresso riservato ai soci.<br/>
        Se non vuoi più ricevere comunicazioni, contattaci per aggiornare le preferenze.
      </p>
    </div>
  `;
}

function renderSmsTemplate({ member, title, event_date, message_sms }) {
  const nome = member.full_name || "Socio";
  let body = message_sms || "";

  body = body.replace(/{{\s*nome\s*}}/gi, nome);

  if (event_date) {
    const dataFormattata = new Date(event_date).toLocaleDateString("it-IT");
    body = body.replace(/{{\s*data_evento\s*}}/gi, dataFormattata);
  }

  return body;
}

/**
 * POST /api/admin/send-campaign
 * Invio reale + log
 *
 * campaign_logs.status deve essere 'sent' o 'failed'
 */
router.post("/send-campaign", adminAuthMiddleware, async (req, res) => {
  try {
    const { title, event_date, message_email, message_sms, channels } =
      req.body || {};

    if (!title) {
      return res
        .status(400)
        .json({ message: "Titolo campagna obbligatorio" });
    }

    // 1) crea record campagna
    const { data: campaign, error: campErr } = await supabaseAdmin
      .from("campaigns")
      .insert({
        title,
        event_date: event_date || null,
        message_email: message_email || null,
        message_sms: message_sms || null,
        status: "sending",
      })
      .select("*")
      .single();

    if (campErr) {
      console.error(campErr);
      return res.status(500).json({ message: "Errore creazione campagna" });
    }

    // 2) prendi tutti i soci che hanno accettato marketing
    const { data: members, error: memErr } = await supabaseAdmin
      .from("members")
      .select("*")
      .eq("accept_marketing", true);

    if (memErr) {
      console.error(memErr);
      return res.status(500).json({ message: "Errore lettura soci" });
    }

    const logs = [];

    // 3) Invio reale + salvataggio log
    for (const m of members || []) {
      // ricavo email decriptata / fallback
      let emailPlain = m.email ?? "";
      if (!emailPlain && m.email_enc) {
        emailPlain = safeDecrypt(m.email_enc, "");
      }

      // EMAIL
      if (channels?.email && emailPlain && message_email) {
        const html = renderEmailTemplate({
          member: m,
          title,
          event_date,
          message_email,
        });

        const result = await sendEmailToMember({
          to: emailPlain,
          subject: title,
          html,
        });

        logs.push({
          campaign_id: campaign.id,
          member_id: m.id,
          channel: "email",
          status: result.ok ? "sent" : "failed",
          error: result.ok ? null : result.reason,
        });
      }

      // SMS: usa phone / phone_enc
      if (channels?.sms && message_sms && (m.phone || m.phone_enc)) {
        const rawPhone = m.phone_enc
          ? safeDecrypt(m.phone_enc, m.phone ?? "")
          : m.phone ?? "";

        const normalized = normalizeItalianPhone(rawPhone);
        if (normalized) {
          const result = await sendSmsToMember({
            to: normalized,
            body: renderSmsTemplate({
              member: m,
              title,
              event_date,
              message_sms,
            }),
          });

          logs.push({
            campaign_id: campaign.id,
            member_id: m.id,
            channel: "sms",
            status: result.ok ? "sent" : "failed",
            error: result.ok ? null : result.reason,
          });
        }
      }
    }

    if (logs.length) {
      const { error: logErr } = await supabaseAdmin
        .from("campaign_logs")
        .insert(logs);

      if (logErr) {
        console.error("Errore salvataggio log:", logErr);
      }
    }

    // 4) aggiorna stato campagna
    await supabaseAdmin
      .from("campaigns")
      .update({ status: "sent" })
      .eq("id", campaign.id);

    return res.json({
      ok: true,
      campaign_id: campaign.id,
      recipients: members?.length || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore invio campagna" });
  }
});

export default router;
