// server/routes/admin.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../supabaseClient.js";
import { adminAuthMiddleware } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// POST /api/admin/register  (usata una volta via curl)
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

// POST /api/admin/login
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

        const token = jwt.sign(
            { sub: admin.id, email: admin.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: false, // in prod true con HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Errore login" });
    }
});

// 🔥 GET /api/admin/me  → QUESTA È QUELLA CHE MANCA E TI DÀ 404
router.get("/me", adminAuthMiddleware, (req, res) => {
    return res.json({
        id: req.admin.id,
        email: req.admin.email,
    });
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
    res.clearCookie("admin_token");
    return res.json({ ok: true });
});

// GET /api/admin/members.xml  (export lista soci in XML)
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
            xml += `  <member>\n`;
            xml += `    <id>${m.id}</id>\n`;
            xml += `    <created_at>${m.created_at}</created_at>\n`;
            xml += `    <full_name>${m.full_name ?? ""}</full_name>\n`;
            xml += `    <email>${m.email ?? ""}</email>\n`;
            xml += `    <phone>${m.phone ?? ""}</phone>\n`;
            xml += `    <city>${m.city ?? ""}</city>\n`;
            xml += `    <accept_marketing>${m.accept_marketing}</accept_marketing>\n`;
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

// POST /api/admin/send-campaign
router.post("/send-campaign", adminAuthMiddleware, async (req, res) => {
    try {
        const { title, event_date, message_email, message_sms, channels } =
            req.body || {};

        if (!title) {
            return res.status(400).json({ message: "Titolo campagna obbligatorio" });
        }

        // 1) crea record campagna
        const { data: campaign, error: campErr } = await supabaseAdmin
            .from("campaigns")
            .insert({
                title,
                event_date: event_date || null,
                message_email: message_email || null,
                message_sms: message_sms || null,
                status: "draft", // oppure "sending"
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

        // 3) QUI andrebbe integrato con provider email/SMS (SendGrid, Mailersend, Twilio, ecc.)
        // Per ora facciamo finta di mandarli e logghiamo soltanto in campaign_logs
        const logs = [];

        for (const m of members || []) {
            if (channels?.email && m.email) {
                logs.push({
                    campaign_id: campaign.id,
                    member_id: m.id,
                    channel: "email",
                    status: "sent",
                    error: null,
                });
            }
            if (channels?.sms && m.phone) {
                logs.push({
                    campaign_id: campaign.id,
                    member_id: m.id,
                    channel: "sms",
                    status: "sent",
                    error: null,
                });
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
