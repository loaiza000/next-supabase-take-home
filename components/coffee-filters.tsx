"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  countries, genders, pageUrl, parseFilters, sleepQualities, stressLevels,
  type Filters,
} from "@/lib/coffee-health";

type DraftFilters = {
  country: string;
  gender: string;
  sleepQuality: string;
  stressLevel: string;
  minAge: string;
  maxAge: string;
};

function draftFrom(filters: Filters): DraftFilters {
  return {
    country: filters.country,
    gender: filters.gender,
    sleepQuality: filters.sleepQuality,
    stressLevel: filters.stressLevel,
    minAge: filters.minAge?.toString() ?? "",
    maxAge: filters.maxAge?.toString() ?? "",
  };
}

function filterUrl(draft: DraftFilters) {
  return pageUrl(parseFilters(draft));
}

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">All</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function CoffeeFilters({ initialFilters }: { initialFilters: Filters }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => draftFrom(initialFilters));
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const latestDraft = useRef(draft);
  const lastNavigation = useRef(filterUrl(draftFrom(initialFilters)));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function navigate(next: DraftFilters, force = false) {
    let url: string;
    try {
      url = filterUrl(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid age range.");
      return;
    }
    setError("");
    if (!force && url === lastNavigation.current) return;
    if (force && url === lastNavigation.current && !window.location.search) return;
    lastNavigation.current = url;
    startTransition(() => router.replace(url, { scroll: false }));
  }

  function update(name: keyof DraftFilters, value: string, age: boolean) {
    const next = { ...latestDraft.current, [name]: value };
    latestDraft.current = next;
    setDraft(next);
    cancelTimer();

    if (!age) {
      setWaiting(false);
      navigate(next);
      return;
    }

    try {
      const url = filterUrl(next);
      setError("");
      if (url === lastNavigation.current) {
        setWaiting(false);
        return;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid age range.");
      setWaiting(false);
      return;
    }

    setWaiting(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setWaiting(false);
      navigate(latestDraft.current);
    }, 400);
  }

  function clearFilters() {
    cancelTimer();
    const empty = draftFrom(parseFilters({}));
    latestDraft.current = empty;
    setDraft(empty);
    setWaiting(false);
    setError("");
    navigate(empty, true);
  }

  useEffect(() => {
    function syncFromHistory() {
      cancelTimer();
      let filters: Filters;
      try {
        filters = parseFilters(Object.fromEntries(new URLSearchParams(window.location.search)));
      } catch {
        filters = parseFilters({});
      }
      const next = draftFrom(filters);
      latestDraft.current = next;
      lastNavigation.current = filterUrl(next);
      setDraft(next);
      setError("");
      setWaiting(false);
    }

    window.addEventListener("popstate", syncFromHistory);
    return () => {
      window.removeEventListener("popstate", syncFromHistory);
      cancelTimer();
    };
  }, []);

  return (
    <div className="border-b px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold">Filters</h2>
        <div className="flex items-center gap-4">
          <span role="status" aria-live="polite" className="min-w-16 text-right text-xs text-muted-foreground">
            {waiting || isPending ? "Updating…" : ""}
          </span>
          <button type="button" onClick={clearFilters} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Clear filters
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <FilterSelect label="Country" value={draft.country} options={countries} onChange={(value) => update("country", value, false)} />
        <FilterSelect label="Gender" value={draft.gender} options={genders} onChange={(value) => update("gender", value, false)} />
        <FilterSelect label="Sleep quality" value={draft.sleepQuality} options={sleepQualities} onChange={(value) => update("sleepQuality", value, false)} />
        <FilterSelect label="Stress level" value={draft.stressLevel} options={stressLevels} onChange={(value) => update("stressLevel", value, false)} />
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          Min age
          <Input type="number" min="0" max="120" value={draft.minAge} onChange={(event) => update("minAge", event.target.value, true)} aria-invalid={!!error} aria-describedby={error ? "age-range-error" : undefined} className="min-w-0" />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          Max age
          <Input type="number" min="0" max="120" value={draft.maxAge} onChange={(event) => update("maxAge", event.target.value, true)} aria-invalid={!!error} aria-describedby={error ? "age-range-error" : undefined} className="min-w-0" />
        </label>
      </div>
      {error && <p id="age-range-error" role="alert" className="mt-3 text-xs text-rose-700">{error}</p>}
    </div>
  );
}
