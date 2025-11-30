# 🌌 UTOPIA — Futuristic Night Club Platform  
### Frontend + Backend + Admin Dashboard

Utopia è una **piattaforma completa** per la gestione di un night club esclusivo, con estetica futuristica e funzionalità avanzate per la registrazione e amministrazione dei soci.

L’intero progetto utilizza **React + Vite** per il frontend e un **backend Node/Express** che gestisce login admin, registrazioni, upload documenti, invio email e integrazioni esterne.

---

## 🚀 Tech Stack

### Frontend

- ⚛️ **React 19**
- ⚡ **Vite 7**
- 🎨 **Tailwind CSS 4** — stile dark futuristico neon
- 🎞️ **Framer Motion** — animazioni e micro–interazioni
- 🔔 **SweetAlert2** — popup di conferma / errore eleganti
- 🔗 **React Router 7** — gestione delle pagine
- 🧩 **Lucide React Icons** & `react-icons`
- 🎛 **Three.js** — scena 3D sincronizzata allo scroll e alla musica
- 🎵 **Global Audio Player** — player fisso che controlla la colonna sonora del sito
- 📡 **Supabase JS Client** — invio di form e salvataggio dati

### Backend

- 🟩 **Node.js + Express 5**
- 🔐 **JWT** — autenticazione admin
- 🔑 **bcryptjs** — hashing password admin
- 🧾 **multer** — upload di documenti (fronte/retro)
- 🌩️ **Supabase Storage / DB** — storage privato documenti + tabelle `members` e `contact_messages`
- ✉️ **Resend** — invio email automatiche (es. conferme)
- 📱 **Twilio** — canale SMS / two-factor / recovery code
- 🍪 **cookie-parser**
- 🔒 **CORS** configurato per ambiente dev/prod

Avvio locale tipico:

```bash
# frontend
npm run dev

# backend
node server/index.js
```

---

## ✨ Funzionalità Utente

### 🌀 Landing Page Futuristica

Composta da:

- **Navbar** fissa con logo, link alle sezioni e social (`Navbar.jsx`)
- **HeroSection** con titolo animato, CTA “Diventa socio” e card con logo flottante
- **ScrollScene3D** (Three.js) che crea uno sfondo 3D animato, sincronizzato con lo scroll
- **AboutSection** con card 3D tilt–effect e descrizione del club
- **ContactSection** con:
  - Box social 3D (`SocialBox3D`)
  - Form contatti collegato a Supabase (`contact_messages`)

### 🎧 Audio Player Globale

- Componente `ClubAudioPlayer` ancorato in basso a sinistra
- Utilizza un `<audio id="club-audio">` globale
- Playlist locale con brani demo (`/audio/track_*.mp3`)
- Controlli:
  - Play / Pause
  - Traccia successiva / precedente
  - Seekbar con tempo corrente / durata
- Il player alimenta anche la scena 3D (`ScrollScene3D`) che reagisce ai bassi / medi della traccia

### 📝 Form di Ammissione a Socio

Pagina `/ammissione-socio` (`MembershipForm.jsx`):

- Dati anagrafici completi (nome, cognome, nascita, CF, città, contatti)
- Upload **fronte** e **retro** del documento con:
  - Cattura da fotocamera (mobile) o upload da file
  - Anteprima live e nome file
- Upload dei file verso il backend tramite endpoint:
  - `POST /api/admin/upload-document` → salva su Supabase Storage (bucket privato) e restituisce URL firmato
- Salvataggio record in Supabase tabella `members`
- Consensi:
  - Privacy
  - Statuto Utopia + ACSI
  - Marketing (newsletter/SMS) opzionale
- Notifiche:
  - SweetAlert2 di successo
  - Messaggi di errore in-page

---

## 🧑‍💼 Admin Area

### Login & Protezione Route

- Login su `/admin/login`
- Rotte protette tramite componente `AdminRoute`:
  - Verifica autenticazione chiamando `GET /api/admin/me` (con cookie)
  - Se non autenticato → redirect a `/admin/login`

### Admin Dashboard (`/admin`)

Entry point: `AdminDashboard.jsx`  
Tab principali:

1. **Log Soci (Members)**
   - Visualizza richieste di ammissione salvate in Supabase
   - Accesso a dati anagrafici e link ai documenti (fronte/retro)
   - Filtri / ricerca (implementati in `MembersPanel`)

2. **Log Contatti**
   - Elenco dei messaggi inviati dal form della pagina Contatti
   - Lettura rapida con dettagli (nome, email, telefono, messaggio)
   - Implementato in `ContactMessagesPanel`

3. **Nuova Campagna**
   - Componente `NewCampaign`
   - Gestione bozza di campagne (email / SMS) verso soci
   - Integra servizi esterni: **Resend** per email, **Twilio** per SMS (a livello backend)

### Export Anagrafiche Soci in XML

- Pulsante “Export soci XML”
- Chiama `GET /api/admin/members.xml` (con credenziali)
- Genera e scarica file `utopia_soci_YYYY-MM-DD.xml` lato client

### Logout

- Pulsante “Esci dall’area admin”
- Effettua `POST /api/admin/logout`
- Svuota cookie e fa redirect a `/admin/login`

---

## 🌐 Struttura di Routing

- `/` → `Home.jsx`
  - `Navbar`, `ScrollScene3D`, `HeroSection`, `AboutSection`, `ContactSection`, `Footer`
- `/ammissione-socio` → `MembershipForm.jsx`
- `/admin/login` → pagina login admin
- `/admin` → `AdminRoute` + `AdminDashboard.jsx` (tab Members / Contacts / Campaign)

---

## 🧱 Architettura Dati

### Supabase

- **Tabella `members`**
  - `full_name`
  - `email`
  - `phone`
  - `city`
  - `date_of_birth`
  - `birth_place`
  - `fiscal_code`
  - `note`
  - `accept_privacy`
  - `accept_marketing`
  - `source`
  - `document_front_url`
  - `document_back_url`
  - timestamp automatico

- **Tabella `contact_messages`**
  - `name`
  - `email`
  - `phone`
  - `message`
  - timestamp automatico

- **Storage (bucket privato)**
  - Folder giornaliero `YYYY-MM-DD/…`
  - File per fronte e retro documento, con path generato da backend
  - URL firmati usati solo in area admin

---

## 🔐 Sicurezza & Note Operative

- Password admin hashate con **bcryptjs**
- Autenticazione via **JWT** salvato in cookie HttpOnly
- Admin route protette dal middleware backend e da `AdminRoute` sul frontend
- Upload documenti:
  - Gestiti da **multer** sul backend
  - Salvati su Supabase Storage con permessi ristretti
- Twilio usato per inviare SMS o gestire recovery / 2FA  
  Recovery code di esempio (ambiente demo): `5W7RG34JVZXQXPFLNUG2GMD6`

---

## 🧑‍💻 Developer

Realizzato con ❤️ da **MaDGiiRL**  
🔗 [LinkedIn](https://www.linkedin.com/in/sofia-vidotto-junior-developer/)

---

## 📄 Licenza

Questo template **NON** è libero per uso didattico, portfolio o prototipazione.  
È un progetto privato, sviluppato per scopi professionali.
