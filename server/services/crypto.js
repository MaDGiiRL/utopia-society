import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const RAW_KEY = process.env.ENCRYPTION_KEY || "";

if (!RAW_KEY) {
    console.warn(
        "[crypto] ENCRYPTION_KEY non impostata: cifratura DISABILITATA."
    );
}

// Normalizzo la chiave a 32 byte (AES-256)
const KEY = Buffer.from(
    RAW_KEY.length >= 32 ? RAW_KEY.slice(0, 32) : RAW_KEY.padEnd(32, "0"),
    "utf8"
);

export function encrypt(text) {
    if (!text || !RAW_KEY) return text;

    const iv = crypto.randomBytes(12); // 96 bit per GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return [
        iv.toString("base64"),
        tag.toString("base64"),
        encrypted.toString("base64"),
    ].join(":");
}

export function decrypt(payload) {
    if (!payload || !RAW_KEY) return payload;

    try {
        const [ivB64, tagB64, dataB64] = payload.split(":");
        const iv = Buffer.from(ivB64, "base64");
        const tag = Buffer.from(tagB64, "base64");
        const encrypted = Buffer.from(dataB64, "base64");

        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    } catch (err) {
        console.error("[crypto] Errore in decrypt:", err);
        // fallback: restituisco il payload grezzo per non spaccare tutto
        return payload;
    }
}

/**
 * Helper: prova a decifrare, se non riesce torna il fallback (o stringa vuota)
 */
export function safeDecrypt(encValue, fallback = "") {
    if (!encValue) return fallback ?? "";
    const result = decrypt(encValue);
    return result || fallback || "";
}
