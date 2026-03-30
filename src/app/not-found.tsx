import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-16 text-center">
      <div className="mb-6 flex items-end gap-1 opacity-30">
        <div className="w-3 h-8 bg-loss rounded-sm" />
        <div className="w-3 h-14 bg-loss rounded-sm" />
        <div className="w-3 h-6 bg-loss rounded-sm" />
        <div className="w-3 h-10 bg-loss rounded-sm" />
        <div className="w-3 h-4 bg-loss rounded-sm" />
      </div>

      <h1 className="text-6xl font-black text-text-muted">404</h1>
      <p className="mt-2 text-lg font-semibold text-text-secondary">Page Not Found</p>
      <p className="mt-1 text-sm text-text-muted max-w-xs">
        This chart doesn&apos;t exist. Maybe it was a short-lived trend.
      </p>

      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/play"
          className="rounded-xl bg-accent py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Start Trading
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-border py-3 text-center text-sm font-medium text-text-secondary transition-all hover:bg-surface-secondary"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
