// Helpers for ministry year (Sep 1 – Aug 31)
export function currentMinistryStartYear(now = new Date()): number {
  const y = now.getFullYear();
  // For 2026 onwards, default to 2026 or upcoming Sep year
  return Math.max(y, 2026);
}

export function ministryLabel(startYear: number): string {
  return `${startYear}/${startYear + 1}`;
}

// Returns months in ministry year order: Sep..Dec, Jan..Aug
export function ministryMonths(startYear: number): { year: number; month: number }[] {
  const arr: { year: number; month: number }[] = [];
  for (let m = 8; m <= 11; m++) arr.push({ year: startYear, month: m });
  for (let m = 0; m <= 7; m++) arr.push({ year: startYear + 1, month: m });
  return arr;
}
