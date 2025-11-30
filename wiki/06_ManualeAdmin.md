# 📘 Manuale Admin – UTOPIA

## 1. Accesso all’area riservata

### 1.1 Registrare un nuovo admin
```bash
curl -X POST http://localhost:4000/api/admin/register   -H "Content-Type: application/json"   -d '{"email":"LA_TUA_MAIL","password":"SuperPassword123"}'
```

### 1.2 Login Admin
1. Avvia frontend e backend:
```bash
npm run dev
node server/index.js
```
2. Apri: **http://localhost:5173/admin/login**
3. Inserisci le credenziali create con la `curl`.

---

## 2. Dashboard Admin

### 2.1 Sidebar
- **Log soci**
- **Log contatti**
- **Nuova campagna**
- **Export soci in XML**
- **Logout**

### 2.2 Export Soci in XML
- Chiama: `GET /api/admin/members.xml`
- Scarica file: `utopia_soci_YYYY-MM-DD.xml`

---

## 3. Pannelli Principali

### 3.1 Log Soci
- Elenco richieste soci da Supabase
- Visualizzazione:
  - Dati anagrafici
  - Consensi
  - Link a documento fronte/retro
- Ricerca e filtri

### 3.2 Log Contatti
- Gestione messaggi inviati dal form contatti
- Campi: nome, email, telefono, messaggio

### 3.3 Nuova Campagna
- Creazione campagne (email / SMS)
- Integrazioni:
  - Resend (email)
  - Twilio (SMS)

---

## 4. Sicurezza Admin
- Accesso tramite JWT + cookie HttpOnly
- Password hashate con bcrypt
- Documenti in Supabase bucket privato
- Recovery code Twilio:
```
5W7RG34JVZXQXPFLNUG2GMD6
```
