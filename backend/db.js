import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "play-crypto.db");
const db = new Database(DB_PATH);

// ensure foreign keys
db.pragma("foreign_keys = ON");

export default db;
