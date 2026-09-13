"use client";

type AuthGateProps = {
  session?: unknown;
  isAdmin?: boolean;
  githubUser?: string;
};

export function AuthGate({ isAdmin = false, githubUser = "public" }: AuthGateProps) {
  return (
    <div className="rounded-[2rem] border border-line bg-black/20 p-6 text-sm text-muted">
      <div className="text-xs uppercase tracking-[0.22em] text-gold">Dashboard</div>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink">
        Public ledger only
      </h2>
      <p className="mt-3 leading-6 text-muted">
        OAuth is disabled. The dashboard is public and read-only for {githubUser}.
      </p>
      {isAdmin ? <p className="mt-3 text-credit">Admin access is disabled.</p> : null}
    </div>
  );
}
