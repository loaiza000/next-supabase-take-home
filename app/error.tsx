"use client";

import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#f8f8f7] pb-8">
      <div className="mx-auto w-full max-w-[1920px] px-4 pt-7 sm:px-6 sm:pt-9 xl:px-8 2xl:px-10">
        <header className="mb-6">
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">Medallo.dev</p>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-[1.875rem]">
            <Coffee className="h-6 w-6 shrink-0 text-zinc-600" strokeWidth={1.7} aria-hidden="true" />
            Coffee &amp; health records
          </h1>
        </header>
        <section className="rounded-md border border-zinc-200 bg-white p-6 sm:p-8">
          <h2 className="text-base font-semibold">Unable to load records</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try again. If the problem persists, check that local Supabase is running.
          </p>
          <Button type="button" variant="outline" onClick={reset} className="mt-5">Try again</Button>
        </section>
      </div>
    </main>
  );
}
