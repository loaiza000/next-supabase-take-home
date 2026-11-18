import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

console.log("Starting local Supabase...");
execSync(`${pnpm} exec supabase start`, { stdio: ["ignore", "ignore", "inherit"] });
const status = execSync(`${pnpm} exec supabase status -o env`, { encoding: "utf8" });
const values = Object.fromEntries(
  status.split(/\r?\n/).filter((line) => line.includes("=")).map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1).replace(/^"|"$/g, "")];
  }),
);

const url = values.API_URL;
const anonKey = values.PUBLISHABLE_KEY || values.ANON_KEY;
if (!url || !anonKey) {
  throw new Error("Supabase status did not provide the URL and anon key.");
}

writeFileSync(".env.local", `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}\n`);
console.log("Wrote .env.local");
