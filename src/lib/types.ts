export type EntryType = "credit" | "expense";

export type LedgerEntry = {
  id: number;
  type: EntryType;
  amount: number;
  description: string;
  category: string;
  occurred_on: string;
  created_at: string;
};

export type DailyRollup = {
  date: string;
  credit: number;
  expense: number;
  net: number;
};

export type LedgerSummary = {
  credit: number;
  expense: number;
  balance: number;
  count: number;
};

export type LedgerPayload = {
  entries: LedgerEntry[];
  summary: LedgerSummary;
  daily: DailyRollup[];
};

export const CREDIT_CATEGORIES = [
  "Salary",
  "Transfer",
  "Refund",
  "Cash in",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Rent",
  "Other",
] as const;
