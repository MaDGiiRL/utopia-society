// server/services/members.js
import { supabaseAdmin } from "../supabaseClient.js";
import { encrypt, safeDecrypt } from "./crypto.js";

/**
 * Normalizza il payload in arrivo dal form (camelCase vs snake_case).
 */
function normalizeFormPayload(body = {}) {
    return {
        fullName: body.full_name ?? body.fullName ?? "",
        email: body.email ?? "",
        phone: body.phone ?? "",
        dateOfBirth: body.date_of_birth ?? body.dateOfBirth ?? null,
        city: body.city ?? "",
        birthPlace: body.birth_place ?? body.birthPlace ?? "",
        fiscalCode: body.fiscal_code ?? body.fiscalCode ?? "",
        acceptPrivacy:
            body.accept_privacy ??
            body.acceptPrivacy ??
            body.privacy ??
            false,
        acceptMarketing:
            body.accept_marketing ??
            body.acceptMarketing ??
            body.marketing ??
            false,
        note: body.note ?? body.notes ?? "",
        source: body.source ?? "membership_form",
        documentFrontUrl:
            body.document_front_url ?? body.documentFrontUrl ?? "",
        documentBackUrl:
            body.document_back_url ?? body.documentBackUrl ?? "",
    };
}

/**
 * Crea un nuovo membro partendo dai dati del form pubblico.
 * Cifra email, phone e fiscal_code nelle colonne *_enc.
 */
export async function createMemberFromForm(rawBody) {
    const {
        fullName,
        email,
        phone,
        dateOfBirth,
        city,
        birthPlace,
        fiscalCode,
        acceptPrivacy,
        acceptMarketing,
        note,
        source,
        documentFrontUrl,
        documentBackUrl,
    } = normalizeFormPayload(rawBody);

    if (!fullName || !email) {
        const err = new Error("full_name ed email sono obbligatori");
        err.statusCode = 400;
        throw err;
    }

    if (!acceptPrivacy) {
        const err = new Error("Consenso privacy obbligatorio");
        err.statusCode = 400;
        throw err;
    }

    const phonePlain = phone || null;
    const fiscalPlain = fiscalCode || null;
    const emailPlain = email || null;

    const insertPayload = {
        full_name: fullName,

        // valori in chiaro (opzionali, ma li teniamo per ricerca / fallback)
        email: emailPlain,
        phone: phonePlain,
        fiscal_code: fiscalPlain,

        // valori cifrati
        email_enc: emailPlain ? encrypt(emailPlain) : null,
        phone_enc: phonePlain ? encrypt(phonePlain) : null,
        fiscal_code_enc: fiscalPlain ? encrypt(fiscalPlain) : null,

        date_of_birth: dateOfBirth || null,
        city: city || null,
        accept_privacy: !!acceptPrivacy,
        accept_marketing: !!acceptMarketing,
        note: note || null,
        source: source || "membership_form",
        birth_place: birthPlace || null,
        document_front_url: documentFrontUrl || null,
        document_back_url: documentBackUrl || null,
    };

    const { data, error } = await supabaseAdmin
        .from("members")
        .insert(insertPayload)
        .select("*")
        .single();

    if (error) {
        console.error("[membersService] createMemberFromForm error", error);
        const err = new Error("Errore creazione membro");
        err.statusCode = 500;
        throw err;
    }

    // ritorno oggetto "pulito" (sempre decriptato) per eventuali usi
    return mapMemberRowDecrypted(data);
}

/**
 * Helper: mappa una row del DB in un oggetto pulito con campi decriptati.
 */
export function mapMemberRowDecrypted(m) {
    if (!m) return null;

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

    return {
        id: m.id,
        created_at: m.created_at,
        full_name: m.full_name,
        email: emailPlain,
        phone: phonePlain,
        date_of_birth: m.date_of_birth,
        birth_place: m.birth_place,
        fiscal_code: fiscalPlain,
        city: m.city,
        accept_privacy: m.accept_privacy,
        accept_marketing: m.accept_marketing,
        note: m.note,
        source: m.source,
        document_front_url: m.document_front_url,
        document_back_url: m.document_back_url,
    };
}
