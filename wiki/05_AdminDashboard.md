# 05 — Admin Dashboard

La Dashboard è accessibile solo dopo login.  
Percorso:

```
/admin
```

---

# 🔒 Protezione

Componente: `AdminRoute.jsx`

- Chiama `/api/admin/me`
- Se ok → mostra dashboard
- Se 401 → redirect `/admin/login`

---

# 🧱 Layout Admin

Componente principale:

`AdminDashboard.jsx`

Struttura:
- Sidebar sinistra
- Area contenuto dinamico

Elementi sidebar:
- Logo + testo
- Nav:
  - Log Soci
  - Log Contatti
  - Nuova Campagna
- Export XML
- Logout

---

# 📘 Pannelli

## 1️⃣ Members Panel

Mostra tabella soci:
- full_name
- email
- phone
- document_front_url / back_url
- created_at
- consensi

Azioni:
- Ricerca
- Filtri
- Apertura documento
- Analisi info socio

---

## 2️⃣ Contact Messages Panel

Dati provenienti da `contact_messages`:
- Nome
- Email
- Telefono
- Messaggio
- Data

---

## 3️⃣ New Campaign Panel

Form campagna:
- Titolo
- Messaggio email (HTML)
- Messaggio SMS (plain)
- Data evento (opzionale)
- Canali:
  - email
  - sms

Al submit:
- Chiama `/api/admin/send-campaign`
- Mostra notifica con numero destinatari

---

# 🔄 Logout

Pulsante:
- Chiama `POST /api/admin/logout`
- Redirect a `/admin/login`

---

# 📥 Export Soci XML

- Pulsante laterale
- Chiama `GET /api/admin/members.xml`
- Scarica file `utopia_soci_YYYY-MM-DD.xml`

---

---

La wiki completa è pronta: Overview + Frontend + Backend + API + Dashboard.
