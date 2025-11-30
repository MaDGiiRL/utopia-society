# Guida Admin Dashboard

## Registrare un nuovo admin

Apri un terminale **bash** dentro al progetto ed esegui:

``` bash
curl -X POST http://localhost:4000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"la tua mail","password":"SuperPassword123"}'
```

------------------------------------------------------------------------

## Avviare l'Admin Dashboard in locale

Apri **due** terminali bash:

1.  Nel primo:

    ``` bash
    npm run dev
    ```

2.  Nel secondo:

    ``` bash
    node server/index.js
    ```

Ora visita:

👉 http://localhost:5173/admin/login

Accedi con l'email e la password impostate nella registrazione.

------------------------------------------------------------------------

## Recovery code Twilio

    5W7RG34JVZXQXPFLNUG2GMD6
