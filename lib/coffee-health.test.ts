import { describe, expect, it } from "vitest";
import { pageUrl, parseFilters } from "./coffee-health";

describe("coffee health filters", () => {
  it("uses the root URL when no filters are set", () => {
    expect(pageUrl(parseFilters({}))).toBe("/");
  });
  it("parses valid filters and preserves them when paging", () => {
    const filters = parseFilters({ country: "South Korea", minAge: "30", after: "50" });
    expect(filters.country).toBe("South Korea");
    expect(filters.minAge).toBe(30);
    expect(pageUrl(filters, "before", 42)).toBe("/?country=South+Korea&minAge=30&before=42");
  });

  it.each([
    { minAge: "30.5" }, { minAge: "-1" }, { maxAge: "121" },
    { minAge: "50", maxAge: "40" }, { country: "Atlantis" },
    { after: "2", before: "3" }, { after: "1;drop table" },
    { country: ["Germany", "France"] },
    { after: "2147483648" },
  ])("rejects invalid external parameters: %j", (params) => {
    expect(() => parseFilters(params)).toThrow();
  });
});
