// server/services/membersService.js
const { supabaseAdmin } = require("../supabaseClient"); // controlla il nome export
const { encrypt, decrypt } = require("./crypto");

/**
 * Mappa una row del DB (con campi cifrati) in un oggetto "pulito"
 * per il frontend admin.
 */
function mapMemberRow(row) {
    if (!row) return null;

    return {
        id: row.id,
        createdAt: row.created_at,
        name: row.name,
        surname: row.surname,
        email: row.email, // puoi decidere se cifrarla o meno
        city: row.city,
        marketing: row.marketing,

        // cifrati
        fiscalCode: row.fiscal_code_enc ? decrypt(row.fiscal_code_enc) : null,
        phone: row.phone_enc ? decrypt(row.phone_enc) : null,
        birthDate: row.birth_date, // se vuoi cifrare anche questo, cambia come sopra
        birthPlace: row.birth_place,

        notes: row.notes || null,
        docFrontUrl: row.doc_front_url || null,
        docBackUrl: row.doc_back_url || null,
        source: row.source || null
    };
}

/**
 * Crea un nuovo socio.
 * payload: oggetto con i campi in chiaro dal form membership.
 */
async function createMember(payload) {
    const { data, error } = await supabaseAdmin
        .from("members") // nome tabella
        .insert({
            name: payload.name,
            surname: payload.surname,
            email: payload.email,
            city: payload.city,
            marketing: payload.marketing === true,
            birth_date: payload.birthDate,
            birth_place: payload.birthPlace,
            notes: payload.notes || null,
            source: "membership_form",

            // --- campi cifrati ---
            fiscal_code_enc: payload.fiscalCode
                ? encrypt(payload.fiscalCode)
                : null,
            phone_enc: payload.phone ? encrypt(payload.phone) : null,

            // documenti (URL / path nel bucket)
            doc_front_url: payload.docFrontUrl || null,
            doc_back_url: payload.docBackUrl || null
        })
        .select("*")
        .single();

    if (error) {
        console.error("[membersService] createMember error", error);
        throw error;
    }

    return mapMemberRow(data);
}

/**
 * Lista soci (per la tab admin).
 * filters può contenere search / city / marketing.
 */
async function listMembers(filters = {}) {
    let query = supabaseAdmin.from("members").select("*").order("created_at", {
        ascending: false
    });

    if (filters.city && filters.city !== "ALL") {
        query = query.eq("city", filters.city);
    }

    if (filters.marketing === true) {
        query = query.eq("marketing", true);
    }

    if (filters.search) {
        // semplice ricerca su nome / email / città
        const s = `%${filters.search}%`;
        query = query.or(
            `name.ilike.${s},surname.ilike.${s},email.ilike.${s},city.ilike.${s}`
        );
    }

    const { data, error } = await query;

    if (error) {
        console.error("[membersService] listMembers error", error);
        throw error;
    }

    return data.map(mapMemberRow);
}

/**
 * Recupera un singolo socio per ID.
 */
async function getMemberById(id) {
    const { data, error } = await supabaseAdmin
        .from("members")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("[membersService] getMemberById error", error);
        throw error;
    }

    return mapMemberRow(data);
}

module.exports = {
    createMember,
    listMembers,
    getMemberById
};
