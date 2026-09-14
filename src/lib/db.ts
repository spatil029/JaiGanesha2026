import fs from "node:fs";
import path from "node:path";
import type { DailyRollup, LedgerEntry, LedgerPayload } from "./types";

const defaultEntries: LedgerEntry[] = [
  {
    id: 1,
    type: "credit",
    amount: 1000,
    description: "from flat 305",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 2,
    type: "credit",
    amount: 2000,
    description: "from 401 and 402",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 3,
    type: "credit",
    amount: 1000,
    description: "from 204",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 4,
    type: "credit",
    amount: 1000,
    description: "from 103",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 5,
    type: "credit",
    amount: 1000,
    description: "from 004",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 6,
    type: "credit",
    amount: 1000,
    description: "from 101",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 7,
    type: "credit",
    amount: 1000,
    description: "from 005",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 8,
    type: "credit",
    amount: 1001,
    description: "from 105",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 9,
    type: "expense",
    amount: 1000,
    description: "Gouri Ganesha",
    category: "Other",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 10,
    type: "expense",
    amount: 1000,
    description: "Poojari advance",
    category: "Other",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 11,
    type: "expense",
    amount: 3000,
    description: "decoration advance",
    category: "Shopping",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 12,
    type: "expense",
    amount: 400,
    description: "fruits",
    category: "Food",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 13,
    type: "expense",
    amount: 540,
    description: "banana, coconut, pomegranates",
    category: "Food",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 14,
    type: "credit",
    amount: 1000,
    description: "from 302",
    category: "Transfer",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 15,
    type: "expense",
    amount: 270,
    description: "Pooja shop",
    category: "Other",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 16,
    type: "expense",
    amount: 100,
    description: "Banana tree",
    category: "Other",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 17,
    type: "expense",
    amount: 150,
    description: "flowers",
    category: "Other",
    occurred_on: "2026-09-13",
    created_at: "2026-09-13 00:00:00",
  },
  {
    id: 18,
    type: "expense",
    amount: 747,
    description: "pooja materials",
    category: "Other",
    occurred_on: "2026-09-14",
    created_at: "2026-09-14 00:00:00",
  },
];

const storageDir = process.env.VERCEL ? "/tmp/account-ledger" : path.join(process.cwd(), "data");
const storageFile = path.join(storageDir, "ledger.json");

function ensureStore() {
  fs.mkdirSync(storageDir, { recursive: true });

  if (!fs.existsSync(storageFile)) {
    fs.writeFileSync(storageFile, JSON.stringify({ entries: defaultEntries }, null, 2));
  }
}

function readEntries(): LedgerEntry[] {
  ensureStore();

  try {
    const raw = fs.readFileSync(storageFile, "utf8");
    const parsed = JSON.parse(raw) as { entries?: LedgerEntry[] };

    if (Array.isArray(parsed.entries) && parsed.entries.length > 0) {
      return parsed.entries
        .slice()
        .sort((a, b) => new Date(b.occurred_on).getTime() - new Date(a.occurred_on).getTime() || b.id - a.id);
    }
  } catch {
    // ignore and fall back to defaults
  }

  fs.writeFileSync(storageFile, JSON.stringify({ entries: defaultEntries }, null, 2));
  return defaultEntries.slice();
}

function writeEntries(entries: LedgerEntry[]) {
  ensureStore();
  fs.writeFileSync(storageFile, JSON.stringify({ entries }, null, 2));
}

export function listLedger(): LedgerPayload {
  const entries = readEntries();

  const summaryRow = entries.reduce(
    (acc, entry) => {
      if (entry.type === "credit") acc.credit += entry.amount;
      if (entry.type === "expense") acc.expense += entry.amount;
      acc.count += 1;
      return acc;
    },
    { credit: 0, expense: 0, count: 0 },
  );

  const dailyMap = new Map<string, { credit: number; expense: number }>();

  for (const entry of entries) {
    const current = dailyMap.get(entry.occurred_on) ?? { credit: 0, expense: 0 };
    if (entry.type === "credit") current.credit += entry.amount;
    if (entry.type === "expense") current.expense += entry.amount;
    dailyMap.set(entry.occurred_on, current);
  }

  const daily = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      credit: value.credit,
      expense: value.expense,
      net: value.credit - value.expense,
    }));

  return {
    entries,
    summary: {
      credit: summaryRow.credit,
      expense: summaryRow.expense,
      balance: summaryRow.credit - summaryRow.expense,
      count: summaryRow.count,
    },
    daily,
  };
}

export function createEntry(input: {
  type: "credit" | "expense";
  amount: number;
  description: string;
  category: string;
  occurred_on: string;
}) {
  const entries = readEntries();
  const nextId = entries.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;

  const newEntry: LedgerEntry = {
    id: nextId,
    type: input.type,
    amount: Number(input.amount),
    description: input.description,
    category: input.category,
    occurred_on: input.occurred_on,
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  const nextEntries = [newEntry, ...entries]
    .sort((a, b) => new Date(b.occurred_on).getTime() - new Date(a.occurred_on).getTime() || b.id - a.id);

  writeEntries(nextEntries);

  return newEntry;
}
