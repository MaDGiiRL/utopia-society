// src/components/ContactSection.jsx

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

// UI
import ContactInfo from "./contact/ContactInfo";
import ContactForm from "./contact/ContactForm";

// API
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

    const formEl = e.currentTarget; // 👈 salvo il form
    const form = new FormData(formEl);

    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      message: String(form.get("message") || "").trim(),
      source_page: "contact_section",
    };

    try {
      const data = await sendContactMessage(payload);

      if (!data.ok) {
        console.error("/api/admin/contact response error:", data);
        throw new Error(data.message || "Form submission error");
      }

      setOk(true);

      // 👇 Reset sicuro del form
      if (formEl && typeof formEl.reset === "function") {
        formEl.reset();
      }
    } catch (err) {
      console.error("Submission error:", err);
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
