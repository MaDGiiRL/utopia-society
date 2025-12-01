# 🌌 UTOPIA — Futuristic Night Club Platform

### Frontend + Backend Core (NPM privato) + Admin Dashboard

Utopia è una **piattaforma completa** per la gestione di un night club esclusivo, con estetica futuristica e funzionalità avanzate per la registrazione e amministrazione dei soci.

L’architettura è divisa in:

- **Frontend pubblico** (React + Vite)
- **Backend core** incapsulato in un **pacchetto NPM privato** di proprietà dell’autrice
- **Dashboard admin** per la gestione operativa

Il backend (Express) non è presente nel repository pubblico, ma viene installato come dipendenza privata tramite NPM (`@madgiirl/utopia-core`).  
Questo garantisce la **protezione della logica interna**, dei servizi e degli algoritmi di criptazione.

---

## 🚀 Tech Stack

### Frontend

- ⚛️ **React 19**
- ⚡ **Vite 7**
- 🎨 **Tailwind CSS 4**
- 🎞️ **Framer Motion**
- 🔔 **SweetAlert2**
- 🔗 **React Router 7**
- 🧩 **Lucide Icons**
- 🎛 **Three.js**
- 🎵 **Global Audio Player**
- 📡 **Supabase JS Client**

### Backend (core privato NPM)

Il backend è strutturato come modulo interno, pubblicato come **pacchetto NPM privato**:

- 🟩 **Node + Express 5**
- 🔐 **JWT Authentication**
- 🔑 **bcryptjs**
- 🧾 **multer** upload
- 🌩️ **Supabase Storage & DB**
- ✉️ **Resend**
- 📱 **Twilio**
- 🍪 **cookie-parser**
- 🔒 **CORS** dinamico dev/prod

### 🔏 Criptazione Dati Sensibili

Il backend core implementa un sistema di **criptazione trasparente**:

✔️ I dati vengono cifrati prima del salvataggio su Supabase  
✔️ Vengono decifrati solo lato server quando richiesti dall’area admin  
✔️ Nessun dato critico viaggia o rimane mai in chiaro

Tabelle protette (Supabase):

- `members`
- `contact_messages`
- `campaigns`
- `campaign_logs`

Campi considerati sensibili:

- anagrafica soci
- documenti caricati
- email, telefono
- messaggi
- note interne

---

## 🧩 Backend via NPM Privato

Il backend è distribuito come pacchetto NPM privato:

```sh
npm install @madgiirl/utopia-core --registry=https://npm.pkg.github.com
```

L'app host lo avvia così:

```js
import { startUtopiaAdminServer } from "@madgiirl/utopia-core";

startUtopiaAdminServer({ port: process.env.PORT });
```

In questo modo:

- nessun sorgente backend è presente nel progetto pubblico
- la logica è isolata, sicura e aggiornata tramite versioning NPM
- solo chi ha accesso al registry GitHub può installarlo

---

## ☁️ Deploy & Hosting

### 🌐 Frontend

- **Vercel**
- Build automatica da GitHub
- Variabili ambiente (`VITE_*`)

### 🖥️ Backend

- **Render.com**
- Usa il core privato NPM
- Deploy automatico
- CORS e Cookie configurati per comunicazione sicura con Vercel

### 📦 Supabase

- Database Postgres
- Storage documenti privato
- Row Level Security attiva
- Accesso mediato solo dal backend privato

### ✉️ Resend & Twilio

- Email & SMS delivery
- Integrati dal backend privato

---

## ✨ Funzionalità Principali

### Landing Page

- Animazioni futuristiche
- Audio sincronizzato
- Scroll 3D

### Gestione Soci

- Form di iscrizione criptato
- Upload documento fronte/retro
- Storage privato

### Contact System

- Messaggi contatti memorizzati in Supabase
- Sempre cifrati
- Consultabili solo via Admin Panel

### Admin Panel

- Login protetto JWT HttpOnly
- Gestione soci
- Log contatti
- Campagne email e SMS
- Esportazioni in XML e CSV

---

## 🔐 Sicurezza

- Password hashate con bcrypt
- Dati personali criptati AES
- JWT HttpOnly
- CORS rigido
- Backend chiuso e privato
- Variabili ambiente nascoste su Vercel & Render

📌 Nemmeno in Supabase i dati sono leggibili in chiaro.

---

## 🧑‍💻 Developer

Realizzato con ❤️ da **MaDGiiRL**  
🔗 https://www.linkedin.com/in/sofia-vidotto-junior-developer/

---

## 📄 Licenza

Questo progetto è privato e non destinato a uso pubblico.  
Il backend è distribuito come **NPM privato** e non può essere riutilizzato o copiato senza consenso.
