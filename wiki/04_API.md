# 04 — API Reference (UTOPIA)

Tutte le API vivono sotto:

```
/api/admin/*
```

---

# 🔑 Autenticazione

### **POST /api/admin/register**
Crea un nuovo admin (una volta sola via curl)

**Body**
```json
{ "email": "", "password": "" }
```

---

### **POST /api/admin/login**
Effettua login e crea cookie HttpOnly.

---

### **GET /api/admin/me**
Ritorna dati admin loggato.

---

### **POST /api/admin/logout**
Cancella cookie admin.

---

# 📄 Upload Documenti

### **POST /api/admin/upload-document**
Upload pubblico per MembershipForm.

**Form-data**
```
file: binary
path: string
```

Ritorna:
```
{ ok, path, signedUrl }
```

---

# 🧾 Export Soci

### **GET /api/admin/members.xml**
Protetto da adminAuthMiddleware.  
Ritorna XML con tutti i soci.

---

# 📣 Campagne

### **POST /api/admin/send-campaign**

Body:
```json
{
  "title": "",
  "event_date": "",
  "message_email": "",
  "message_sms": "",
  "channels": {
    "email": true,
    "sms": true
  }
}
```

Output:
```
{ ok: true, campaign_id, recipients }
```

---

# ❗ Errori Standard

- `401` – Non autenticato / Token errato
- `400` – Richiesta non valida
- `409` – Conflitto (file già esistente)
- `500` – Errore server

---

API complete.  
La prossima sezione descrive la Admin Dashboard lato frontend.
