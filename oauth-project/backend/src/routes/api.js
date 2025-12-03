// src/routes/api.js
import { Router } from "express";
import auth from "../middleware/auth.js";

const router = Router();

// Geschützter Endpoint
router.get("/data", auth, (req, res) => {
  res.json({
    message: "Geschützte Daten aus dem Backend",
    timestamp: new Date().toISOString(),
    user: req.auth, // hier siehst du die Claims aus dem Token
  });
});

export default router;
