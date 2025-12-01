// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import itCommon from "../locales/it/common.json";
import enCommon from "../locales/en/common.json";
import roCommon from "../locales/ro/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: { common: itCommon },
      en: { common: enCommon },
      ro: { common: roCommon },
    },
    fallbackLng: "it",
    supportedLngs: ["it", "en", "ro"],
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "link"],
    },
  });

export default i18n;
