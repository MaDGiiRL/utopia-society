# 02 — Frontend (React + Vite)

Il frontend di UTOPIA è una SPA moderna costruita con:

- **React 19**
- **Vite 7**
- **TailwindCSS 4**
- **Framer Motion**
- **Three.js** (scene animate reattive all’audio)
- **React Router 7**
- Gestione audio globale
- Componenti 3D interattivi

---

# 📌 Routing

File: `src/routes/Routing.jsx`

```
/
├── Home
├── /ammissione-socio → MembershipForm
└── /admin
     ├── /login
     └── / * protette da AdminRoute
```

`AdminRoute` effettua una chiamata a `/api/admin/me` e permette l’accesso solo se il cookie admin è valido.

---

# 🧱 Layout

File: `src/layout/Layout.jsx`

- Mostra sempre **Navbar**
- Mostra sempre **Footer**
- Nasconde entrambi in `/admin/*`
- Inserisce:
  - `<ClubAudioPlayer />`
  - `<audio id="club-audio">`

---

# 🎧 Global Audio Player

Componenti:
- `ClubAudioPlayer.jsx`
- `<audio id="club-audio">`

Funzionalità:
- Play, pausa, avanti, indietro
- Seekbar completa
- Titolo, artista, durata
- Stato persistente
- Comunica con Three.js per effetti reattivi alla musica

---

# 🌌 Three.js — ScrollScene3D

Il componente `ScrollScene3D.jsx` crea una scena 3D futuristica:

- Laser bars
- Blob dinamico
- Anelli neon
- Particelle
- Luci pulsanti
- Equalizer sincronizzato alla musica tramite **Web Audio API**

La scena cambia sezione in base allo scroll.

---

# 🏠 Home Page

Elementi principali:

### `HeroSection.jsx`
- Card 3D floating
- CTA “Diventa socio”
- Titoli animati con Framer Motion

### `AboutSection.jsx`
- Tre card futuristiche con tilt effect

### `ContactSection.jsx`
- Form contatto salvato in Supabase
- SocialBox3D (scene 3D separata)
- Messaggi validati e confermati tramite SweetAlert2

---

# 📝 Membership Form

File: `MembershipForm.jsx`

Sezioni compilabili:
- Dati anagrafici
- Contatti
- Documento identità (upload)
- Note
- Consensi privacy e marketing

Flusso:
1. Caricamento **fronte/retro** documento → `POST /api/admin/upload-document`
2. Ottieni path e signedUrl
3. Salva record in Supabase (`members`)
4. Mostra SweetAlert2 di conferma

---

# ⚠️ Rotte Admin (Frontend)

File: `AdminRoute.jsx`

```
- Chiama /api/admin/me
- Se 200 → mostra componente interno
- Se 401 → redirect /admin/login
```

---

Questa sezione descrive il frontend.  
La prossima sezione copre il backend completo.
