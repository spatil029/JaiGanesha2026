"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatDay, formatMoney } from "@/lib/format";
import type { LedgerEntry } from "@/lib/types";
import AnimatedNumber from "@/components/AnimatedNumber";

type Props = {
  entries: LedgerEntry[];
};

export function LedgerTimeline({ entries }: Props) {
  const groups = groupByDay(entries);

  return (
    <section className="glass rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Public book</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink">
            Ledger
          </h2>
        </div>
        <p className="text-sm text-muted">{entries.length} lines</p>
      </div>

      {groups.length === 0 ? (
        <p className="mt-10 text-muted">The book is empty. Post the first line.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <div key={group.date}>
              <div className="mb-3 flex items-baseline justify-between border-b border-line pb-2">
                <h3 className="text-sm font-medium tracking-wide text-gold">
                  {formatDay(group.date)}
                </h3>
                <p className="font-mono text-xs text-muted">
                  in <AnimatedNumber value={group.credit} format={formatMoney} duration={2000} /> · out <AnimatedNumber value={group.expense} format={formatMoney} duration={2000} />
                </p>
              </div>
              <ul className="space-y-2">
                {group.entries.map((entry) => {
                  const isCredit = entry.type === "credit";
                  return (
                    <li
                      key={entry.id}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-black/20 px-4 py-3"
                    >
                      <span
                        className={`grid size-10 place-items-center rounded-full ${
                          isCredit ? "bg-credit/15 text-credit" : "bg-expense/15 text-expense"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="size-4" />
                        ) : (
                          <ArrowUpRight className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-ink">{entry.description}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">
                          {entry.category}
                        </p>
                      </div>
                      <p
                        className={`font-[family-name:var(--font-display)] text-xl ${
                          isCredit ? "text-credit" : "text-expense"
                        }`}
                      >
                        {isCredit ? "+" : "−"}
                        <AnimatedNumber value={entry.amount} format={formatMoney} duration={2000} />
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function groupByDay(entries: LedgerEntry[]) {
  const map = new Map<
    string,
    { date: string; credit: number; expense: number; entries: LedgerEntry[] }
  >();

  for (const entry of entries) {
    const current = map.get(entry.occurred_on) ?? {
      date: entry.occurred_on,
      credit: 0,
      expense: 0,
      entries: [],
    };
    current.entries.push(entry);
    if (entry.type === "credit") current.credit += entry.amount;
    else current.expense += entry.amount;
    map.set(entry.occurred_on, current);
  }

  return [...map.values()];
}
