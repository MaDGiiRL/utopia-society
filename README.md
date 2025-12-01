# 🌌 UTOPIA — Futuristic Night Club Platform  
### Frontend + Backend + Admin Dashboard

Utopia è una **piattaforma completa** per la gestione di un night club esclusivo, con estetica futuristica e funzionalità avanzate per la registrazione e amministrazione dei soci.

L’intero progetto utilizza **React + Vite** per il frontend e un **backend Node/Express** che gestisce login admin, registrazioni, upload documenti, invio email e integrazioni esterne.

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

### Backend
- 🟩 **Node + Express 5**
- 🔐 **JWT Authentication**
- 🔑 **bcryptjs**
- 🧾 **multer** upload
- 🌩️ **Supabase Storage & DB**
- ✉️ **Resend**
- 📱 **Twilio**
- 🍪 **cookie-parser**
- 🔒 **CORS** dinamico dev/prod

Avvio locale:

```bash
npm run dev    # frontend
node server/index.js   # backend
```

---

## ☁️ Deploy & Hosting

L’infrastruttura di Utopia è completamente deployata e funzionante in ambiente cloud:

### 🌐 **Frontend**
- **Vercel**
- Deployment continuo collegato a GitHub
- Variabili ambiente gestite tramite pannello Vercel (`VITE_*`)

### 🖥️ **Backend**
- **Render.com**  
- Deploy automatico da GitHub branch `main`
- Variabili ambiente protette nel pannello Render  
- Runtime Node.js  
- Porta gestita automaticamente da Render (binding su `$PORT`)
- CORS configurato per comunicare correttamente con Vercel  
- Cookie JWT configurati correttamente (`secure`, `sameSite=none`, `HttpOnly`)

### 📦 Supabase
- Database Postgres gestito
- Bucket Storage privato per i documenti
- API REST + Client JS

### ✉️ Email + SMS Providers
- **Resend**  
- **Twilio**

Utopia risulta quindi distribuita su un’architettura moderna separata **frontend / backend**, con:

- Backend → `https://utopia-society.onrender.com`
- Frontend → `https://utopia-society.vercel.app`

Il tutto comunicante tramite HTTPS, cookie sicuri e CORS configurato correttamente.

---

## ✨ Funzionalità Utente

### 🌀 Landing Page Futuristica
- Navbar animata
- HeroSection con CTA
- ScrollScene3D sincronizzata alla musica
- AboutSection con tilt 3D
- ContactSection collegata a Supabase

### 🎧 Audio Player Globale
- Player fisso con controlli
- Sincronizzazione con la scena 3D

### 📝 Form Ammissione Socio
- Upload documento fronte/retro
- URL firmati da Supabase Storage
- Salvataggio su tabella `members`

---

## 🧑‍💼 Admin Area

### Login & Protezione
- Login con JWT in cookie HttpOnly
- Rotte protette tramite `AdminRoute`

### Dashboard
- Gestione soci
- Log contatti
- Sistema campagne email/SMS

### Export Soci XML
`GET /api/admin/members.xml`

### Logout
`POST /api/admin/logout`

---

## 🧱 Architettura Dati (Supabase)

### Tabella `members`
Campi anagrafici, documenti, consensi.

### Tabella `contact_messages`
Messaggi dal form contatti.

### Storage
Bucket privato per documenti.

---

## 🔐 Sicurezza
- Password hashate con bcrypt
- JWT HttpOnly
- CORS rigido
- Upload protetti

---

## 🧑‍💻 Developer
Realizzato con ❤️ da **MaDGiiRL**  
🔗 https://www.linkedin.com/in/sofia-vidotto-junior-developer/

---

## 📄 Licenza
Questo template è un progetto privato non destinato a uso pubblico.
