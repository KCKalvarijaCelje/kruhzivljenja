// Helpers for ministry year (Sep 1 – Aug 31)
export function currentMinistryStartYear(now = new Date()): number {
  const y = now.getFullYear();
  return now.getMonth() >= 8 ? y : y - 1; // month 8 = September (0-indexed)
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
