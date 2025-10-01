import express from "express";
import { getUserByUsername, getWalletByUserId } from "../models.js";
const router = express.Router();

router.get("/me/:username", (req, res) => {
  const username = req.params.username;
  const user = getUserByUsername(username);
  if (!user) return res.status(404).json({ error: "not found" });
  const wallet = getWalletByUserId(user.id);
  res.json({ user, wallet });
});

export default router;
