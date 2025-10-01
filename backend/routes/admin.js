import express from "express";
import { getUserByUsername, updateWalletBalance } from "../models.js";

const router = express.Router();
// simple passcode-based tiny auth (demo only)
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "2486";

router.post("/set-balance", (req, res) => {
  const { passcode, username, newBalance } = req.body;
  if (passcode !== ADMIN_PASSCODE) return res.status(403).json({ error: "invalid passcode" });

  const user = getUserByUsername(username);
  if (!user) return res.status(404).json({ error: "user not found" });

  const updated = updateWalletBalance(user.id, newBalance);
  res.json({ ok: true, wallet: updated });
});

export default router;
