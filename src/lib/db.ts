import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { DailyRollup, LedgerEntry, LedgerPayload } from "./types";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "ledger.db");

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

export const db =
  globalForDb.sqlite ??
  new Database(dbPath);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = db;
}

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('credit', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    occurred_on TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const count = db.prepare("SELECT COUNT(*) AS n FROM entries").get() as { n: number };

if (count.n === 0) {
  const insert = db.prepare(`
    INSERT INTO entries (type, amount, description, category, occurred_on, created_at)
    VALUES (@type, @amount, @description, @category, @occurred_on, @created_at)
  `);

  const seed = db.transaction(() => {
    insert.run({
      type: "credit",
      amount: 85000,
      description: "September salary",
      category: "Salary",
      occurred_on: "2026-09-01",
      created_at: "2026-09-01 09:12:00",
    });
    insert.run({
      type: "expense",
      amount: 18500,
      description: "Home rent",
      category: "Rent",
      occurred_on: "2026-09-02",
      created_at: "2026-09-02 11:04:00",
    });
    insert.run({
      type: "expense",
      amount: 2460,
      description: "Weekly groceries",
      category: "Food",
      occurred_on: "2026-09-05",
      created_at: "2026-09-05 18:40:00",
    });
    insert.run({
      type: "credit",
      amount: 4200,
      description: "Client reimbursement",
      category: "Refund",
      occurred_on: "2026-09-08",
      created_at: "2026-09-08 14:22:00",
    });
    insert.run({
      type: "expense",
      amount: 890,
      description: "Metro + auto",
      category: "Transport",
      occurred_on: "2026-09-10",
      created_at: "2026-09-10 21:05:00",
    });
    insert.run({
      type: "expense",
      amount: 1599,
      description: "Electricity bill",
      category: "Bills",
      occurred_on: "2026-09-12",
      created_at: "2026-09-12 08:18:00",
    });
  });

  seed();
}

export function listLedger(): LedgerPayload {
  const entries = db
    .prepare(
      `SELECT id, type, amount, description, category, occurred_on, created_at
       FROM entries
       ORDER BY occurred_on DESC, id DESC`,
    )
    .all() as LedgerEntry[];

  const summaryRow = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS credit,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
         COUNT(*) AS count
       FROM entries`,
    )
    .get() as { credit: number; expense: number; count: number };

  const daily = db
    .prepare(
      `SELECT
         occurred_on AS date,
         COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS credit,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM entries
       GROUP BY occurred_on
       ORDER BY occurred_on ASC`,
    )
    .all() as { date: string; credit: number; expense: number }[];

  const rollup: DailyRollup[] = daily.map((day) => ({
    date: day.date,
    credit: day.credit,
    expense: day.expense,
    net: day.credit - day.expense,
  }));

  return {
    entries,
    summary: {
      credit: summaryRow.credit,
      expense: summaryRow.expense,
      balance: summaryRow.credit - summaryRow.expense,
      count: summaryRow.count,
    },
    daily: rollup,
  };
}

export function createEntry(input: {
  type: "credit" | "expense";
  amount: number;
  description: string;
  category: string;
  occurred_on: string;
}) {
  const result = db
    .prepare(
      `INSERT INTO entries (type, amount, description, category, occurred_on)
       VALUES (@type, @amount, @description, @category, @occurred_on)`,
    )
    .run(input);

  return db
    .prepare(
      `SELECT id, type, amount, description, category, occurred_on, created_at
       FROM entries WHERE id = ?`,
    )
    .get(result.lastInsertRowid) as LedgerEntry;
}
