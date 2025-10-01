import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server as IOServer } from "socket.io";
import db from "./db.js";
import { initDb, createUser, createWalletForUser, upsertAsset, listAssets, getUserByUsername, getWalletByUserId, createTrade, listRecentTrades, addTestimonial, listTestimonials, updateWalletBalance } from "./models.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

initDb();

// Basic endpoints
app.get("/api/assets", (req, res) => {
  const assets = listAssets();
  res.json(assets);
});

app.get("/api/trades", (req, res) => {
  res.json(listRecentTrades(100));
});

app.get("/api/testimonials", (req, res) => {
  res.json(listTestimonials(100));
});

app.post("/api/trade", (req, res) => {
  // body: username, symbol, side, amount
  const { username, symbol, side, amount } = req.body;
  if (!username || !symbol || !side || !amount) return res.status(400).json({ error: "missing" });
  const user = getUserByUsername(username);
  if (!user) return res.status(404).json({ error: "user not found" });

  // fetch price from assets table
  const asset = db.prepare("SELECT * FROM assets WHERE symbol = ?").get(symbol);
  if (!asset) return res.status(404).json({ error: "asset not found" });
  const price = asset.price;
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) return res.status(400).json({ error: "invalid amount" });

  // Very simple wallet math for demo:
  const walletRow = db.prepare("SELECT * FROM wallets WHERE user_id = ?").get(user.id);
  const wallet = walletRow ? JSON.parse(walletRow.balance_json) : {};
  // buy: deduct quote (USDT) and add base (BTC/ETH)
  if (side === "buy") {
    const total = parsedAmount * price;
    wallet["USDT"] = (wallet["USDT"] || 0) - total;
    wallet[symbol] = (wallet[symbol] || 0) + parsedAmount;
  } else {
    // sell: reduce base and add USDT
    if ((wallet[symbol] || 0) < parsedAmount) return res.status(400).json({ error: "insufficient asset" });
    wallet[symbol] -= parsedAmount;
    wallet["USDT"] = (wallet["USDT"] || 0) + parsedAmount * price;
  }
  // update DB
  db.prepare("UPDATE wallets SET balance_json = ? WHERE user_id = ?").run(JSON.stringify(wallet), user.id);
  const trade = createTrade(user.id, symbol, side, parsedAmount, price);

  // broadcast trade via socket.io (we attach io later)
  if (global.io) global.io.emit("new_trade", { ...trade, display_name: user.display_name });

  res.json({ ok: true, trade, wallet });
});

app.post("/api/testimonial", (req, res) => {
  const { username, text } = req.body;
  const user = getUserByUsername(username);
  if (!user) return res.status(404).json({ error: "user not found" });
  const tm = addTestimonial(user.id, text);
  global.io?.emit("new_testimonial", { ...tm, display_name: user.display_name });
  res.json({ ok: true, testimonial: tm });
});

// admin endpoint to set wallet (use passcode)
app.post("/api/admin/set-balance", (req, res) => {
  const { passcode, username, newBalance } = req.body;
  if ((process.env.ADMIN_PASSCODE || "2486") !== passcode) return res.status(403).json({ error: "bad passcode" });
  const user = getUserByUsername(username);
  if (!user) return res.status(404).json({ error: "user not found" });
  const updated = updateWalletBalance(user.id, newBalance);
  res.json({ ok: true, wallet: updated });
});

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" }});
global.io = io;

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  // optionally join rooms, etc
  socket.on("ping", (d) => socket.emit("pong", { ts: Date.now(), d }));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log("Backend listening on", PORT);
});
