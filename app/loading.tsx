import { Coffee } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f8f8f7] pb-8">
      <div className="mx-auto w-full max-w-[1920px] px-4 pt-7 sm:px-6 sm:pt-9 xl:px-8 2xl:px-10">
        <header className="mb-6">
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">Medallo.dev</p>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-[1.875rem]">
            <Coffee className="h-6 w-6 shrink-0 text-zinc-600" strokeWidth={1.7} aria-hidden="true" />
            Coffee &amp; health records
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Synthetic dataset</p>
        </header>
        <section className="overflow-hidden rounded-md border border-zinc-200 bg-white" aria-busy="true">
          <div className="grid grid-cols-2 gap-3 border-b p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-4 lg:p-8">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-9 rounded-md bg-zinc-100" />)}
          </div>
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground" role="status">
            Loading records…
          </div>
        </section>
      </div>
    </main>
  );
}
