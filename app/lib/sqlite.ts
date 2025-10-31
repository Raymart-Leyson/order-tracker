// @ts-ignore
import Database from "better-sqlite3";
import path from "path";

const isVercel = process.env.VERCEL === "1";

// 🧩 Use /tmp on Vercel (writable directory), local file otherwise
const dbPath = isVercel
  ? path.join("/tmp", "project1.db")
  : path.join(process.cwd(), "project1.db");

console.log("SQLite DB Path:", dbPath);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity TEXT,
    price TEXT,
    date TEXT NOT NULL
  )
`).run();

export default db;
