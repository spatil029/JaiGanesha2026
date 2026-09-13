import { formatMoney } from "@/lib/format";
import type { DailyRollup } from "@/lib/types";

type Props = {
  daily: DailyRollup[];
};

export function DailyBars({ daily }: Props) {
  const recent = daily.slice(-10);
  const max = Math.max(1, ...recent.flatMap((day) => [day.credit, day.expense]));

  return (
    <section className="glass rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Movement</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink">
            Daily credits vs expenses
          </h2>
        </div>
        <p className="text-sm text-muted">Last {recent.length || 0} active days</p>
      </div>

      {recent.length === 0 ? (
        <p className="mt-8 text-muted">No posted days yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-5 gap-3 sm:grid-cols-10">
          {recent.map((day) => {
            const creditH = Math.max(8, (day.credit / max) * 140);
            const expenseH = Math.max(8, (day.expense / max) * 140);
            return (
              <div key={day.date} className="flex flex-col items-center gap-3">
                <div className="flex h-40 items-end gap-1">
                  <div
                    className="w-3 rounded-full bg-credit/80 sm:w-3.5"
                    style={{ height: `${creditH}px` }}
                    title={`Credit ${formatMoney(day.credit)}`}
                  />
                  <div
                    className="w-3 rounded-full bg-expense/80 sm:w-3.5"
                    style={{ height: `${expenseH}px` }}
                    title={`Expense ${formatMoney(day.expense)}`}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted">
                  {day.date.slice(8)}/{day.date.slice(5, 7)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex gap-5 text-xs uppercase tracking-[0.16em] text-muted">
        <span className="inline-flex items-center gap-2">
          <i className="size-2 rounded-full bg-credit" /> Credit
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="size-2 rounded-full bg-expense" /> Expense
        </span>
      </div>
    </section>
  );
}
