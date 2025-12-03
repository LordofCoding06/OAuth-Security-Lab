
# OAuth Security Lab (Vue · Express · Keycloak)

Dies ist ein Schulprojekt aus dem Modul M321. Ziel ist es, einen **OAuth 2.0 Authorization Code Flow** mit **Keycloak**, **Vue 3 (Vite)** und **Node.js/Express** vollständig umzusetzen.  
Der Fokus liegt auf **Security**, **Token Validation** und dem Zusammenspiel der drei Komponenten *Frontend*, *Backend* und *Identity Provider*.

---

## 🔐 Projektüberblick

Das Projekt besteht aus:

- **Frontend (Vue 3 + Vite)**  
  Holt über den *Authorization Code Flow* ein Access Token bei Keycloak und sendet dieses in allen Requests an das Backend.

- **Backend (Express.js)**  
  Stellt einen geschützten Endpoint `/api/data` bereit und validiert das JWT via `express-jwt` + `jwks-rsa` direkt gegen Keycloak.

- **Keycloak (Docker)**  
  Identity Provider, der den OAuth2/OpenID‑Connect Login übernimmt.

---

## 🚀 Features

- Login via **Authorization Code Flow**
- Token-Verwaltung mit **oidc-client-ts**
- Vollständige JWT‑Validierung über **JWKS**
- Geschützter Express‑Endpoint
- Dark‑Mode „Hacker/Security“-UI
- Komplett lokal via Docker lauffähig

---

## 📦 Installation & Setup

### 1. Repository klonen

```sh
git clone https://github.com/LordofCoding06/OAuth-Security-Lab
cd OAuth-Security-Lab
```

---

## 🏗️ Keycloak starten (Docker)

```sh
docker-compose up -d
```

Standard‑URL:  
👉 http://localhost:8080

### Realm & Client Setup

Realm: **security-lab**  
Client: **spa-unsafe**  
Typ: *Public*

**Wichtige Einstellungen:**

| Einstellung | Wert |
|------------|------|
| Standard Flow Enabled | ✔ |
| Redirect URI | `http://localhost:5173/*` |
| Web Origins | `http://localhost:5173` |
| Token Signing Algorithm | RS256 |

---

## 🖥️ Frontend starten (Vue 3)

```sh
cd frontend
npm install
npm run dev
```

Frontend läuft unter:

👉 http://localhost:5173

---

## ⚙️ Backend starten (Express)

```sh
cd backend
npm install
npm run dev
```

Backend läuft unter:

👉 http://localhost:3001

### JWT‑Validierung  
Die Middleware prüft:

- Signatur über JWKS‑Endpoint  
- Issuer (`http://localhost:8080/realms/security-lab`)  
- Ablaufzeit (`exp`)  

**Audience wird nicht geprüft**, da Public Clients kein `aud` setzen.

---

## 🔥 Workflow

1. Nutzer klickt auf **Login mit Keycloak**
2. Keycloak authentifiziert und sendet Authorization‑Code zurück
3. Vue tauscht Code gegen Access Token
4. Vue ruft geschützten Endpoint auf:

```http
GET /api/data
Authorization: Bearer <token>
```

5. Backend prüft JWT → bei Erfolg Antwort mit User‑Claims

---

## 🔒 Geschützter Backend‑Endpoint

Beispielstruktur der Antwort:

```json
{
  "message": "Geschützte Daten aus dem Backend",
  "timestamp": "2025‑12‑03T10:00:00Z",
  "user": {
    "preferred_username": "testuser",
    "realm_access": {
      "roles": ["offline_access", "default-roles"]
    }
  }
}
```

---

## 📁 Projektstruktur

```
oauth-project/
│
├── backend/
│   ├── src/
│   │   ├── middleware/auth.js
│   │   ├── routes/api.js
│   │   └── app.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.vue
│   │   └── main.js
│   ├── vite.config.js
│   └── package.json
│
└── docker-compose.yaml
```

---

## 🧪 Testen

### Geschützte Daten laden

1. Login durchführen  
2. „GET /api/data“ drücken  
3. Backend zeigt Claims + Payload an

Bei 401‑Fehlern:
- Token abgelaufen → neu einloggen
- Keycloak nicht erreichbar
- Backend nicht gestartet

---

## 🎓 Lernziele des Projekts

- Verständnis OAuth 2.0 / OIDC Flow  
- Integration eines Identity Providers (Keycloak)  
- Tokenbasierte API‑Absicherung  
- Praktischer Umgang mit JWKS‑Signaturen  
- Zusammenspiel Frontend ↔ Backend ↔ IdP

---

## ✔️ Fertig!

Das Projekt ist jetzt vollständig implementiert und bereit für die Abgabe oder Erweiterungen.

Viel Erfolg mit deinem Security‑Lab! 🔐  
