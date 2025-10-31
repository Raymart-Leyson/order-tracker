// @ts-ignore
import Database from "better-sqlite3";

let db: Database.Database;

if (!db) {
  db = new Database("project1.db", { verbose: console.log });
  db.pragma("journal_mode = WAL");

  // Create table if not exists
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
}

export default db;