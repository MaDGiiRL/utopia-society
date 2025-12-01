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
 * Cifra phone e fiscal_code nelle colonne *_enc.
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

    const insertPayload = {
        full_name: fullName,
        email,
        phone: phonePlain, // tieni il valore in chiaro (opzionale)
        phone_enc: phonePlain ? encrypt(phonePlain) : null,
        date_of_birth: dateOfBirth || null,
        city: city || null,
        accept_privacy: !!acceptPrivacy,
        accept_marketing: !!acceptMarketing,
        note: note || null,
        source: source || "membership_form",
        birth_place: birthPlace || null,
        fiscal_code: fiscalPlain,
        fiscal_code_enc: fiscalPlain ? encrypt(fiscalPlain) : null,
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

    // ritorno già un oggetto "pulito" per il frontend se serve
    return {
        id: data.id,
        created_at: data.created_at,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone_enc
            ? safeDecrypt(data.phone_enc, data.phone ?? "")
            : data.phone ?? "",
        date_of_birth: data.date_of_birth,
        city: data.city,
        accept_privacy: data.accept_privacy,
        accept_marketing: data.accept_marketing,
        note: data.note,
        source: data.source,
        birth_place: data.birth_place,
        fiscal_code: data.fiscal_code_enc
            ? safeDecrypt(data.fiscal_code_enc, data.fiscal_code ?? "")
            : data.fiscal_code ?? "",
        document_front_url: data.document_front_url,
        document_back_url: data.document_back_url,
    };
}
