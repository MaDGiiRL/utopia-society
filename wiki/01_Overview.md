# 01 — UTOPIA · Overview

UTOPIA è una piattaforma completa (frontend + backend + admin dashboard) progettata per la gestione di un **night club a iscrizione privata**.  
Integra un’estetica futuristica e funzionalità avanzate:

- Registrazione soci con upload documenti e consensi
- Area admin protetta da JWT + cookie HttpOnly
- Dashboard operativa per gestione soci, contatti e campagne
- Export XML per sistemi terzi
- Invio email (Resend) e SMS (Twilio)
- Storage documenti su Supabase Storage
- Scene 3D con Three.js e audio reattivo

---

## Architettura ad Alto Livello

### **Frontend (React + Vite)**
- Single Page Application
- Routing pubblico + routing protetto admin
- Tema futuristico neon
- Player audio globale
- Scene animate Three.js

### **Backend (Node + Express)**
- API REST sotto `/api/admin`
- Upload documenti con multer
- Supabase Admin SDK per DB e storage
- JWT su cookie HttpOnly
- Integrazioni esterne (Resend, Twilio)

### **Database (Supabase)**
- Tabelle principali:
  - `members`
  - `contact_messages`
  - `admins`
  - `campaigns`
  - `campaign_logs`
- Bucket storage privato “documents”

---

## Flusso Principale Utente

1. L’utente visita `/`
2. Scorre la landing futuristica e clicca “Diventa Socio”
3. Compila `MembershipForm`
4. I documenti vengono caricati nel bucket Supabase → path firmati
5. Un record viene salvato in `members`
6. Notifica finale e redirect controllato

---

## Flusso Admin

1. Login su `/admin/login`
2. Il backend genera JWT → salvato in cookie HttpOnly
3. Accesso alla Dashboard `/admin`
4. Gestione:
   - Soci
   - Contatti
   - Campagne promotional email/SMS
5. Export XML soci
6. Logout che rimuove il cookie

---

## Directory Principali

```
root/
  ├── server/
  │     ├── index.js
  │     ├── routes/
  │     ├── middleware/
  │     ├── services/
  │     └── supabaseClient.js
  ├── src/
  │     ├── components/
  │     ├── pages/
  │     ├── layout/
  │     └── routes/
  └── public/
```

---

Questa panoramica introduce la struttura generale.  
I prossimi file approfondiscono frontend, backend, API e Admin Dashboard.
