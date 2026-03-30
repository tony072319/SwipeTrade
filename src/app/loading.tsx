export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
        <p className="text-xs text-text-muted">Loading...</p>
      </div>
    </main>
  );
}
