# 📙 Documentazione del Sito – UTOPIA

## 1. Architettura Generale

- **Frontend**: React + Vite
- **Backend**: Node/Express
- **DB & Storage**: Supabase
- **Librerie chiave**: Tailwind, Framer Motion, Three.js, SweetAlert2

---

## 2. Routing Principale

- `/` → Home
- `/ammissione-socio` → Membership Form
- `/admin/login` → Login Admin
- `/admin` → Admin Dashboard (protetta)

---

## 3. Componenti Pagina Home

### 3.1 HeroSection

- Titolo animato
- CTA “Diventa socio”
- Card logo 3D animata

### 3.2 AboutSection

- Card 3D tilt
- Descrizione club

### 3.3 ContactSection

- Box Social 3D
- Form contatti → Supabase (`contact_messages`)

### 3.4 ScrollScene3D

- Scena Three.js con:
  - Anelli neon
  - Blob reattivo alla musica
  - Equalizer
  - Particelle

---

## 4. Audio Player Globale

- Player fisso (`ClubAudioPlayer`)
- Controlli:
  - Play/Pause
  - Next/Prev
  - Slider tempo
- Sincronizzato con scena 3D tramite WebAudio API

---

## 5. Membership Form

- Dati anagrafici
- Contatti
- Upload documento fronte/retro
- Invio dati → backend:
  - `POST /api/admin/upload-document`
  - Salvataggio su Supabase Storage
- Insert record → tabella `members`
- SweetAlert2 di conferma

---

## 6. Admin Area

- Autenticazione JWT
- Pannelli:
  - Soci
  - Contatti
  - Campagne
- Export XML soci
- Logout sicuro

---

## 7. Struttura Dati (Supabase)

### Tabella `members`

- full_name
- email
- phone
- city
- date_of_birth
- birth_place
- fiscal_code
- document_front_url
- document_back_url
- consensi
- timestamp

### Tabella `contact_messages`

- name
- email
- phone
- message
- timestamp
