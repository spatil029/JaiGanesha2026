"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { DailyBars } from "@/components/DailyBars";
import { LedgerTimeline } from "@/components/LedgerTimeline";
import AnimatedNumber from "@/components/AnimatedNumber";
import { formatMoney, formatSigned } from "@/lib/format";
import type { LedgerPayload } from "@/lib/types";

export function LedgerApp() {
  const [data, setData] = useState<LedgerPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const paidByHarish = 4665;
  const paidBySahadev = 6706;

  async function load() {
    const response = await fetch("/api/entries", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Could not load the ledger.");
    }
    setData((await response.json()) as LedgerPayload);
  }

  useEffect(() => {
    load()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load the ledger.");
      })
      .finally(() => setLoading(false));
  }, []);

  const latestNet = useMemo(() => {
    if (!data?.daily.length) return 0;
    return data.daily[data.daily.length - 1]?.net ?? 0;
  }, [data]);

  return (
    <div className="paper-grid min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs uppercase tracking-[0.22em] text-gold">
              <BookOpen className="size-3.5" />
              Open books
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-ink sm:text-6xl">
              Daily account ledger
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Credits in, expenses out. This ledger is public and read-only.
            </p>
          </div>
          <div className="glass rounded-3xl px-5 py-4 text-sm text-muted">
            Public dashboard
            <div className="mt-1 font-[family-name:var(--font-display)] text-lg text-gold">
              Read only
            </div>
          </div>
        </header>

        {error ? (
          <div className="glass rounded-3xl px-6 py-8 text-expense">{error}</div>
        ) : loading || !data ? (
          <div className="glass h-72 animate-pulse rounded-[2rem]" />
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
              <article className="glass relative overflow-hidden rounded-[2rem] p-7 sm:p-8">
                <div className="absolute -right-8 -top-10 size-48 rounded-full bg-gold/10 blur-3xl" />
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Current balance
                </p>
                <p className="mt-4 font-[family-name:var(--font-display)] text-5xl text-ink sm:text-7xl">
                  <AnimatedNumber value={data.summary.balance} format={formatMoney} duration={2000} />
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <Sparkles className="size-4 text-gold" />
                  Latest day {formatSigned(latestNet)} · {data.summary.count} posted lines
                </p>
              </article>

              <article className="glass rounded-[2rem] p-7">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Credit</p>
                  <ArrowDownLeft className="size-5 text-credit" />
                </div>
                <p className="mt-6 font-[family-name:var(--font-display)] text-4xl text-credit">
                  <AnimatedNumber value={data.summary.credit} format={formatMoney} duration={2000} />
                </p>
                <p className="mt-3 text-sm text-muted">Money added to the account</p>
              </article>

              <article className="glass rounded-[2rem] p-7">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Expenses</p>
                  <ArrowUpRight className="size-5 text-expense" />
                </div>
                <p className="mt-6 font-[family-name:var(--font-display)] text-4xl text-expense">
                  <AnimatedNumber value={data.summary.expense} format={formatMoney} duration={2000} />
                </p>
                <p className="mt-3 text-sm text-muted">Money leaving the account</p>
              </article>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="glass rounded-[2rem] border border-sky-400/30 bg-sky-500/5 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Paid by Harish</p>
                <p className="mt-5 font-[family-name:var(--font-display)] text-4xl text-sky-100">
                  <AnimatedNumber value={paidByHarish} format={formatMoney} duration={2000} />
                </p>
                <div className="mt-3 text-sm leading-6 text-muted">
                  <div>1. Flower/Fruits/panche and etc - <AnimatedNumber value={420} format={formatMoney} duration={2000} /></div>
                  <div>2. FOOD - <AnimatedNumber value={3000} format={formatMoney} duration={2000} /> + Transportation - <AnimatedNumber value={450} format={formatMoney} duration={2000} /></div>
                  <div>3. Plates/Glass Etc - <AnimatedNumber value={795} format={formatMoney} duration={2000} /></div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  This amount is included in the main expense total.
                </p>
              </article>

              <article className="glass rounded-[2rem] border border-sky-400/30 bg-sky-500/5 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Paid by Sahadev</p>
                <p className="mt-5 font-[family-name:var(--font-display)] text-4xl text-sky-100">
                  <AnimatedNumber value={paidBySahadev} format={formatMoney} duration={2000} />
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Spent by Sahadev. This amount is included in the main expense total.
                </p>
              </article>
            </div>

            <div className="glass rounded-[2rem] border border-amber-400/40 bg-amber-500/10 px-5 py-4 text-sm leading-6 text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
              <span className="font-semibold uppercase tracking-[0.18em] text-amber-300">Note:</span>{" "}
               Paid by Harish: <span className="font-semibold text-amber-200">{formatMoney(paidByHarish)}</span>. Paid by Sahadev: <span className="font-semibold text-amber-200">{formatMoney(paidBySahadev)}</span>.
            </div>

            <DailyBars daily={data.daily} />

            <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)]">
              <LedgerTimeline entries={data.entries} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
