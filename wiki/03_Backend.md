# 03 — Backend (Node + Express)

Il backend gestisce:
- Autenticazione admin
- Upload documenti
- Export XML soci
- Invio email/SMS
- Campaign system
- Protezione tramite cookie HttpOnly + JWT

---

# 📁 Struttura

```
server/
  ├── index.js
  ├── routes/
  │     └── admin.js
  ├── middleware/
  │     └── auth.js
  ├── services/
  │     └── notifications.js
  └── supabaseClient.js
```

---

# 🔐 Autenticazione (JWT + cookie)

File: `middleware/auth.js`

- Legge cookie `admin_token`
- Verifica JWT
- Inserisce `req.admin = { id, email }`
- Se token assente o invalido → 401

---

# 🛣️ Routing Admin

File: `routes/admin.js`

Endpoint principali:

### **POST /register**
- Da usare una volta per creare admin iniziale
- Password hashate con bcrypt

### **POST /login**
- Verifica email + password
- Genera JWT (7 giorni)
- Set cookie `admin_token` HttpOnly

### **GET /me**
- Ritorna i dati dell’admin loggato

### **POST /logout**
- Cancella cookie

---

# 📄 Upload Documenti

### **POST /upload-document**
- Non richiede autenticazione (usato dal form pubblico)
- Usa multer memory storage
- Salva file nel bucket Supabase “documents”
- Genera signed URL valida 7 giorni

---

# 📤 Export Soci in XML

### **GET /members.xml**
- Protetto da adminAuthMiddleware
- Esporta tutti i soci come:

```xml
<members>
  <member>
    <id>...</id>
    <full_name>...</full_name>
    ...
  </member>
</members>
```

---

# 📣 Campagne Marketing

### **POST /send-campaign**
- Crea una campagna
- Prende tutti i soci con `accept_marketing = true`
- Invia:
  - Email (Resend)
  - SMS (Twilio)
- Salva log in `campaign_logs`
- Aggiorna stato campagna → sent

---

# 📬 Servizi Esterni

File: `services/notifications.js`

### Resend (Email)
- Usa `resend.emails.send`
- Richiede:
  - `RESEND_API_KEY`
  - `RESEND_FROM`

### Twilio (SMS)
- `twilioClient.messages.create`
- Richiede:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM`

### Normalizzazione numeri italiani
- Da `333xxxxxx` → `+39333xxxxxx`

---

# 🗄️ Supabase

File: `supabaseClient.js`

Utilizza:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Permessi:
- RLS disattivato per admin SDK
- Bucket “documents” privato

---

Il backend è ora coperto.  
La prossima sezione elenca l’intera API reference.
