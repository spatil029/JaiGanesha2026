"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { todayISO } from "@/lib/format";
import {
  CREDIT_CATEGORIES,
  EXPENSE_CATEGORIES,
  type EntryType,
  type LedgerPayload,
} from "@/lib/types";

type Props = {
  onCreated: (ledger: LedgerPayload) => void;
};

export function AddEntryForm({ onCreated }: Props) {
  const [type, setType] = useState<EntryType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [occurredOn, setOccurredOn] = useState(todayISO());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const categories = useMemo(
    () => (type === "credit" ? CREDIT_CATEGORIES : EXPENSE_CATEGORIES),
    [type],
  );

  function switchType(next: EntryType) {
    setType(next);
    setCategory(next === "credit" ? CREDIT_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          description,
          category,
          occurred_on: occurredOn,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        ledger?: LedgerPayload;
      };
      if (!response.ok || !payload.ledger) {
        throw new Error(payload.error ?? "Could not save this line.");
      }
      onCreated(payload.ledger);
      setAmount("");
      setDescription("");
      setMessage(type === "credit" ? "Credit posted to the public book." : "Expense posted to the public book.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save this line.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-[2rem] p-6 sm:p-7 lg:sticky lg:top-6">
      <p className="text-xs uppercase tracking-[0.24em] text-gold">Post a line</p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink">
        Add credit or expense
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        New entries appear on the public ledger immediately for every viewer.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-black/25 p-1">
        <button
          type="button"
          onClick={() => switchType("expense")}
          className={`rounded-xl px-3 py-2 text-sm transition ${
            type === "expense" ? "bg-expense/20 text-expense" : "text-muted"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => switchType("credit")}
          className={`rounded-xl px-3 py-2 text-sm transition ${
            type === "credit" ? "bg-credit/20 text-credit" : "text-muted"
          }`}
        >
          Credit
        </button>
      </div>

      <label className="mt-5 block text-xs uppercase tracking-[0.18em] text-muted">
        Amount (INR)
        <input
          required
          min="0.01"
          step="0.01"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          className="mt-2 w-full rounded-2xl border border-line bg-black/30 px-4 py-3 text-lg text-ink outline-none ring-gold/40 placeholder:text-muted/50 focus:ring-2"
        />
      </label>

      <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-muted">
        What is this for?
        <input
          required
          minLength={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Groceries, salary, electricity..."
          className="mt-2 w-full rounded-2xl border border-line bg-black/30 px-4 py-3 text-ink outline-none ring-gold/40 placeholder:text-muted/50 focus:ring-2"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs uppercase tracking-[0.18em] text-muted">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-line bg-black/30 px-4 py-3 text-ink outline-none ring-gold/40 focus:ring-2"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-[0.18em] text-muted">
          Date
          <input
            required
            type="date"
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-line bg-black/30 px-4 py-3 text-ink outline-none ring-gold/40 focus:ring-2"
          />
        </label>
      </div>

      <button
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-4 py-3 font-medium text-[#1a1406] transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Post to ledger
      </button>

      {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
    </form>
  );
}
