import { Resend } from "resend";
import twilio from "twilio";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || "Utopia <no-reply@utopia.local>";

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;

// client Resend (email)
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// client Twilio (sms)
const twilioClient =
    twilioSid && twilioToken ? twilio(twilioSid, twilioToken) : null;

export async function sendEmailToMember({ to, subject, html }) {
    if (!resend) {
        console.warn("Resend non configurato, email non inviata", to, subject);
        return { ok: false, reason: "RESEND_NOT_CONFIGURED" };
    }

    try {
        await resend.emails.send({
            from: resendFrom,
            to,
            subject,
            html,
        });

        return { ok: true };
    } catch (err) {
        console.error("Errore invio email Resend:", err);
        return { ok: false, reason: err.message };
    }
}

export async function sendSmsToMember({ to, body }) {
    if (!twilioClient || !twilioFrom) {
        console.warn("Twilio non configurato, SMS non inviato", to);
        return { ok: false, reason: "TWILIO_NOT_CONFIGURED" };
    }

    try {
        await twilioClient.messages.create({
            from: twilioFrom,
            to,
            body,
        });

        return { ok: true };
    } catch (err) {
        console.error("Errore invio SMS Twilio:", err);
        return { ok: false, reason: err.message };
    }
}

// normalizza numeri italiani stile 333xxxxxxx -> +39333xxxxxxx
export function normalizeItalianPhone(phone) {
    if (!phone) return null;
    let p = String(phone).replace(/\s+/g, "");
    if (!p) return null;

    if (p.startsWith("+")) return p;

    if (p.startsWith("00")) {
        // già in formato internazionale 00xx...
        return "+" + p.slice(2);
    }

    // caso tipico: 333xxxxxxx oppure 03xxxxxxxx
    if (p.startsWith("0")) {
        p = p.replace(/^0/, "");
    }

    return "+39" + p;
}
