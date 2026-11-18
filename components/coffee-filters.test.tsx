import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseFilters } from "@/lib/coffee-health";
import { CoffeeFilters } from "./coffee-filters";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

let root: Root;
let container: HTMLDivElement;

function render(filters = parseFilters({})) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<CoffeeFilters initialFilters={filters} />));
}

function select(index: number, value: string) {
  const element = container.querySelectorAll("select")[index];
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function age(index: number, value: string) {
  const element = container.querySelectorAll('input[type="number"]')[index];
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setValue.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.history.replaceState(null, "", "/");
  replace.mockClear();
  vi.useFakeTimers();
});

afterEach(() => {
  if (root) act(() => root.unmount());
  container?.remove();
  vi.useRealTimers();
});

describe("automatic coffee filters", () => {
  it.each([
    [0, "Germany", "/?country=Germany"],
    [1, "Female", "/?gender=Female"],
    [2, "Good", "/?sleepQuality=Good"],
    [3, "High", "/?stressLevel=High"],
  ])("applies selection %i immediately", (index, value, url) => {
    render();
    select(index, value);
    expect(replace).toHaveBeenCalledExactlyOnceWith(url, { scroll: false });
  });

  it("applies rapid selections together and drops the page cursor", () => {
    render(parseFilters({ after: "50" }));
    select(0, "Germany");
    select(1, "Female");
    select(2, "Good");
    select(3, "Low");
    expect(replace).toHaveBeenLastCalledWith(
      "/?country=Germany&gender=Female&sleepQuality=Good&stressLevel=Low",
      { scroll: false },
    );
    act(() => root.render(<CoffeeFilters initialFilters={parseFilters({ country: "Germany" })} />));
    expect(Array.from(container.querySelectorAll("select"), (element) => element.value)).toEqual([
      "Germany", "Female", "Good", "Low",
    ]);
  });

  it("debounces age changes for 400 ms and avoids duplicate navigation", () => {
    render();
    age(0, "3");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Updating");
    act(() => vi.advanceTimersByTime(200));
    age(0, "30");
    act(() => vi.advanceTimersByTime(399));
    expect(replace).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(replace).toHaveBeenCalledExactlyOnceWith("/?minAge=30", { scroll: false });
    age(0, "030");
    act(() => vi.advanceTimersByTime(500));
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("combines a pending age edit with an immediate selection", () => {
    render();
    age(0, "40");
    act(() => vi.advanceTimersByTime(200));
    select(0, "Germany");
    expect(replace).toHaveBeenCalledExactlyOnceWith("/?country=Germany&minAge=40", { scroll: false });
    act(() => vi.advanceTimersByTime(500));
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("does not navigate for an invalid age range and applies queued selections after correction", () => {
    render(parseFilters({ maxAge: "30" }));
    age(0, "40");
    act(() => vi.advanceTimersByTime(500));
    select(0, "Germany");
    expect(replace).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(/Minimum age/);
    age(1, "50");
    act(() => vi.advanceTimersByTime(400));
    expect(replace).toHaveBeenCalledExactlyOnceWith(
      "/?country=Germany&minAge=40&maxAge=50", { scroll: false },
    );
  });

  it("clears filters and pending age edits immediately", () => {
    window.history.replaceState(null, "", "/?country=Germany&after=50");
    render(parseFilters({ country: "Germany", after: "50" }));
    age(0, "40");
    act(() => container.querySelector("button")!.click());
    expect(replace).toHaveBeenCalledExactlyOnceWith("/", { scroll: false });
    expect(container.querySelector<HTMLSelectElement>("select")?.value).toBe("");
    expect(container.querySelector<HTMLInputElement>('input[type="number"]')?.value).toBe("");
    act(() => vi.advanceTimersByTime(500));
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("syncs controls when browser history changes", () => {
    render();
    act(() => {
      window.history.replaceState(null, "", "/?country=Brazil&minAge=25");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(container.querySelector<HTMLSelectElement>("select")?.value).toBe("Brazil");
    expect(container.querySelector<HTMLInputElement>('input[type="number"]')?.value).toBe("25");
    expect(replace).not.toHaveBeenCalled();
  });
});
