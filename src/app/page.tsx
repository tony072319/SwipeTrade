export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">SwipeTrade</h1>
        <p className="max-w-sm text-lg text-text-secondary">
          Read the chart. Make the call. Swipe right to go long, left to go
          short.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="/play"
            className="rounded-xl bg-text-primary px-6 py-3 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            Start Trading
          </a>
        </div>
      </div>
    </main>
  );
}
