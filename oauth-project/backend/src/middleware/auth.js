// src/middleware/auth.js
import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";

dotenv.config();

const issuer = process.env.KEYCLOAK_ISSUER;
const jwksUri = `${issuer}/protocol/openid-connect/certs`;

export default function authMiddleware(req, res, next) {
  const middleware = expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri,
    }),
    algorithms: ["RS256"],
    issuer,
    // ❗ KEINE audience mehr prüfen!
    // audience: undefined,
    requestProperty: "auth",
  });

  middleware(req, res, (err) => {
    if (err) {
      console.error("JWT-Fehler:", err);
      return res
        .status(401)
        .json({ error: "Ungültiges Token", details: err.message });
    }
    next();
  });
}
