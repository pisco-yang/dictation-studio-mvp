export default function LandingPage() {
  const proverbs = [
    "Little strokes fell great oaks.",
    "Practice makes progress.",
    "Slow is smooth, smooth is fast.",
    "What we hear with patience, we remember with confidence."
  ];

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-line bg-surface/80 px-3 py-1 text-sm font-medium text-accent shadow-sm">
            Listen · Type · Grow
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Welcome back to your listening practice.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            A few focused minutes each day can make English sound less fast, less blurry, and
            more yours.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {proverbs.map((proverb) => (
              <div key={proverb} className="rounded-md border border-line bg-surface/80 p-4 text-muted shadow-sm">
                {proverb}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-lg p-4">
          <div className="rounded-md border border-line bg-paper/80 p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-2/3 rounded bg-line" />
              <div className="h-3 w-full rounded bg-line/70" />
              <div className="h-3 w-4/5 rounded bg-line/70" />
            </div>
            <div className="mt-8 rounded-md border border-line bg-surface p-4">
              <p className="text-sm text-muted">Sentence 3 of 18</p>
              <div className="mt-4 h-24 rounded-md border border-dashed border-line bg-paper" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-10 rounded bg-ink" />
                <div className="h-10 rounded bg-line/70" />
                <div className="h-10 rounded bg-line/70" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
