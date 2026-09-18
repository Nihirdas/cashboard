import { promises as fs } from "fs";
import path from "path";
import type { DividendData } from "@/lib/providers/types";

// Reads the user's REAL dividend data from a git-ignored local file
// (.data/dividends.json). Returns null when it's absent — e.g. on the public
// Vercel deploy — so the app falls back to demo data. Real numbers never ship
// in the repo; they live here locally and, later, in the user's own Drive.
export async function loadLocalDividends(): Promise<DividendData | null> {
  try {
    const file = path.join(process.cwd(), ".data", "dividends.json");
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as DividendData;
  } catch {
    return null;
  }
}
