import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import ContactInfo from "./contact/ContactInfo";
import ContactForm from "./contact/ContactForm";
import { sendContactMessage } from "../api/admin";

function ContactSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const cardsY = useTransform(scrollYProgress, [0, 1], [20, -10]);

  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setOk(false);
    setError("");

    const form = new FormData(e.currentTarget);

    const payload = {
      name: (form.get("name") || "").toString().trim(),
      email: (form.get("email") || "").toString().trim(),
      phone: (form.get("phone") || "").toString().trim(),
      message: (form.get("message") || "").toString().trim(),
      source_page: "contact_section",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await sendContactMessage(payload);
      if (!data.ok) {
        throw new Error(data.message || "Errore invio messaggio");
      }

      if (!res.ok || data.ok === false) {
        console.error("Errore /api/contact:", data);
        throw new Error(data.message || "Errore invio messaggio");
      }

      setOk(true);
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError(t("contact.formError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden py-20 min-h-[90vh]"
    >
      <div className="relative mx-auto max-w-5xl px-4">
        <motion.div
          style={{ y: cardsY }}
          className="grid gap-10 md:grid-cols-[1.1fr_minmax(0,1fr)] items-start"
        >
          <ContactInfo />
          <ContactForm
            sending={sending}
            ok={ok}
            error={error}
            onSubmit={handleSubmit}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default ContactSection;
