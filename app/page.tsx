import Link from "next/link";
import { Coffee } from "lucide-react";
import { CoffeeFilters } from "@/components/coffee-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { pageUrl, parseFilters, type Filters } from "@/lib/coffee-health";
import { getCoffeeHealthPage } from "@/lib/coffee-health-query";

type SearchParams = Record<string, string | string[] | undefined>;

const columns = [
  "ID", "Age", "Gender", "Country", "Coffee / day", "Caffeine (mg)",
  "Sleep (h)", "Sleep quality", "BMI", "Heart rate", "Stress", "Activity (h)",
  "Health issues", "Occupation", "Smoking", "Alcohol",
];

const numericColumns = new Set([
  "ID", "Age", "Coffee / day", "Caffeine (mg)", "Sleep (h)",
  "BMI", "Heart rate", "Activity (h)",
]);

const sleepStyles: Record<string, string> = {
  Excellent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Good: "border-sky-200 bg-sky-50 text-sky-800",
  Fair: "border-amber-200 bg-amber-50 text-amber-900",
  Poor: "border-rose-200 bg-rose-50 text-rose-800",
};

const stressStyles: Record<string, string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Medium: "border-amber-200 bg-amber-50 text-amber-900",
  High: "border-rose-200 bg-rose-50 text-rose-800",
};

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  let filters: Filters;
  let validationError = "";
  try {
    filters = parseFilters(await searchParams);
  } catch (error) {
    validationError = error instanceof Error ? error.message : "Invalid filters.";
    filters = parseFilters({});
  }
  const { rows, hasPrevious, hasNext } = validationError
    ? { rows: [], hasPrevious: false, hasNext: false }
    : await getCoffeeHealthPage(filters);

  return <main className="min-h-screen bg-[#f8f8f7] pb-8 text-foreground">
    <div className="mx-auto w-full max-w-[1920px] px-4 pt-7 sm:px-6 sm:pt-9 xl:px-8 2xl:px-10">
      <header className="mb-6">
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">Medallo.dev</p>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-[1.875rem]">
            <Coffee className="h-6 w-6 shrink-0 text-zinc-600" strokeWidth={1.7} aria-hidden="true" />
            Coffee &amp; health records
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Synthetic dataset</p>
        </div>
      </header>
      <section className="overflow-hidden rounded-md border border-zinc-200 bg-white" aria-label="Coffee health data">
        <CoffeeFilters initialFilters={filters} />
        <div className="border-b px-4 py-2.5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span role="status">{validationError || (rows.length ? `${rows.length} records on this page` : "No matching records")}</span>
        </div>
        <Table
          className="min-w-[1680px]"
          containerClassName="max-h-[min(54vh,600px)] lg:max-h-[min(58vh,640px)]"
          containerLabel="Coffee health records. Scroll for more rows and columns."
        >
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((label, index) => (
                <TableHead
                  key={label}
                  scope="col"
                  className={`sticky top-0 z-20 h-10 border-b bg-zinc-50 px-3 text-xs font-medium text-zinc-600 ${numericColumns.has(label) ? "text-right" : "text-left"} ${index === 0 ? "left-0 z-30 border-r" : ""}`}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => <TableRow key={row.id} className="group hover:bg-zinc-50/80">
              <TableCell className="sticky left-0 z-10 border-r bg-white px-3 py-2 text-right font-medium tabular-nums group-hover:bg-zinc-50">{row.id}</TableCell>
              <TableCell className="px-3 py-2 text-right tabular-nums">{row.age}</TableCell>
              <TableCell className="px-3 py-2">{row.gender}</TableCell>
              <TableCell className="px-3 py-2">{row.country}</TableCell>
              <TableCell className="px-3 py-2 text-right tabular-nums">{row.coffee_intake.toFixed(1)}</TableCell>
              <TableCell className="px-3 py-2 text-right tabular-nums">{row.caffeine_mg.toFixed(1)}</TableCell>
              <TableCell className="px-3 py-2 text-right tabular-nums">{row.sleep_hours.toFixed(1)}</TableCell>
              <TableCell className="px-3 py-2"><Badge variant="outline" className={`rounded-sm px-2 font-medium ${sleepStyles[row.sleep_quality] ?? ""}`}>{row.sleep_quality}</Badge></TableCell>
              <TableCell className="px-3 py-2 text-right tabular-nums">{row.bmi.toFixed(1)}</TableCell>
              <TableCell className="px-3 py-2 text-right tabular-nums">{row.heart_rate}</TableCell>
              <TableCell className="px-3 py-2"><Badge variant="outline" className={`rounded-sm px-2 font-medium ${stressStyles[row.stress_level] ?? ""}`}>{row.stress_level}</Badge></TableCell>
              <TableCell className="px-3 py-2 text-right tabular-nums">{row.physical_activity_hours.toFixed(1)}</TableCell>
              <TableCell className="px-3 py-2">{row.health_issues}</TableCell>
              <TableCell className="px-3 py-2">{row.occupation}</TableCell>
              <TableCell className="px-3 py-2">{row.smoking ? "Yes" : "No"}</TableCell>
              <TableCell className="px-3 py-2">{row.alcohol_consumption ? "Yes" : "No"}</TableCell>
            </TableRow>)}
            {!rows.length && <TableRow>
              <TableCell colSpan={columns.length} className="h-36 px-4 text-center text-sm text-muted-foreground">
                {validationError || (filters.after !== null || filters.before !== null
                  ? "No records on this page. Return to the first page."
                  : "Try adjusting or clearing the filters.")}
              </TableCell>
            </TableRow>}
          </TableBody>
        </Table>
        <nav aria-label="Table pagination" className="flex items-center justify-between gap-3 border-t bg-white px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-xs text-muted-foreground">{rows.length ? `IDs ${rows[0].id}–${rows[rows.length - 1].id}` : "No results"}</span>
          <div className="flex gap-2">
            {!rows.length && (filters.after !== null || filters.before !== null) && <Button asChild variant="outline" size="sm"><Link href={pageUrl(filters)}>First page</Link></Button>}
            {hasPrevious && rows.length ? <Button asChild variant="outline" size="sm"><Link href={pageUrl(filters, "before", rows[0].id)}>Previous</Link></Button> : <Button variant="outline" size="sm" disabled>Previous</Button>}
            {hasNext && rows.length ? <Button asChild variant="outline" size="sm"><Link href={pageUrl(filters, "after", rows[rows.length - 1].id)}>Next</Link></Button> : <Button variant="outline" size="sm" disabled>Next</Button>}
          </div>
        </nav>
      </section>
    </div>
  </main>;
}
