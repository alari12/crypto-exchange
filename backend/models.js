import db from "./db.js";
import { nanoid } from "nanoid";

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      display_name TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      balance_json TEXT, -- JSON object {"BTC": 0.5, "USDT": 200}
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS assets (
      symbol TEXT PRIMARY KEY,
      name TEXT,
      price REAL
    );
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      symbol TEXT,
      side TEXT, -- buy or sell
      amount REAL,
      price REAL,
      total REAL,
      created_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      text TEXT,
      created_at TEXT
    );
  `);
}

export function createUser(username, display_name) {
  const id = nanoid();
  const created_at = new Date().toISOString();
  const stmt = db.prepare("INSERT INTO users (id, username, display_name, created_at) VALUES (?, ?, ?, ?)");
  stmt.run(id, username, display_name, created_at);
  return { id, username, display_name, created_at };
}

export function createWalletForUser(user_id, balanceObj = {}) {
  const id = nanoid();
  const stmt = db.prepare("INSERT INTO wallets (id, user_id, balance_json) VALUES (?, ?, ?)");
  stmt.run(id, user_id, JSON.stringify(balanceObj));
  return { id, user_id, balance: balanceObj };
}

export function getUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export function getWalletByUserId(user_id) {
  const row = db.prepare("SELECT * FROM wallets WHERE user_id = ?").get(user_id);
  if (!row) return null;
  return { id: row.id, user_id: row.user_id, balance: JSON.parse(row.balance_json) };
}

export function updateWalletBalance(user_id, newBalanceObj) {
  const stmt = db.prepare("UPDATE wallets SET balance_json = ? WHERE user_id = ?");
  stmt.run(JSON.stringify(newBalanceObj), user_id);
  return getWalletByUserId(user_id);
}

export function upsertAsset(symbol, name, price) {
  const existing = db.prepare("SELECT * FROM assets WHERE symbol = ?").get(symbol);
  if (existing) {
    db.prepare("UPDATE assets SET name = ?, price = ? WHERE symbol = ?").run(name, price, symbol);
  } else {
    db.prepare("INSERT INTO assets (symbol, name, price) VALUES (?, ?, ?)").run(symbol, name, price);
  }
}

export function listAssets() {
  return db.prepare("SELECT * FROM assets").all();
}

export function createTrade(user_id, symbol, side, amount, price) {
  const id = nanoid();
  const created_at = new Date().toISOString();
  const total = amount * price;
  db.prepare(`INSERT INTO trades (id, user_id, symbol, side, amount, price, total, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, user_id, symbol, side, amount, price, total, created_at);
  return { id, user_id, symbol, side, amount, price, total, created_at };
}

export function listRecentTrades(limit = 50) {
  return db.prepare("SELECT t.*, u.display_name FROM trades t LEFT JOIN users u ON t.user_id = u.id ORDER BY created_at DESC LIMIT ?").all(limit);
}

export function addTestimonial(user_id, text) {
  const id = nanoid();
  const created_at = new Date().toISOString();
  db.prepare("INSERT INTO testimonials (id, user_id, text, created_at) VALUES (?, ?, ?, ?)")
    .run(id, user_id, text, created_at);
  return { id, user_id, text, created_at };
}

export function listTestimonials(limit = 100) {
  return db.prepare("SELECT tm.*, u.display_name FROM testimonials tm LEFT JOIN users u ON tm.user_id = u.id ORDER BY created_at DESC LIMIT ?").all(limit);
}
