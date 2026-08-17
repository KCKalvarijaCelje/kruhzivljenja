import { Wheat, Sandwich, Apple, Carrot, Beef, Cake, Milk, CupSoda, Salad, Croissant, Plus, Minus } from "lucide-react";
import type { TKey } from "@/lib/i18n";

export type FoodChip = {
  key: TKey;
  Icon: React.ComponentType<{ className?: string }>;
  labels: string[]; // all known localized labels (lowercased)
};

// Keep labels in sync with i18n dict entries.
export const FOOD_CHIPS: FoodChip[] = [
  { key: "chipBread", Icon: Wheat, labels: ["bread", "kruh"] },
  { key: "chipSandwiches", Icon: Sandwich, labels: ["sandwiches", "sendviči"] },
  { key: "chipFruit", Icon: Apple, labels: ["fruit", "sadje"] },
  { key: "chipVegetables", Icon: Carrot, labels: ["vegetables", "zelenjava"] },
  { key: "chipMeat", Icon: Beef, labels: ["meat", "meso"] },
  { key: "chipDesserts", Icon: Cake, labels: ["desserts", "sladice"] },
  { key: "chipMilk", Icon: Milk, labels: ["milk", "mleko"] },
  { key: "chipYogurts", Icon: CupSoda, labels: ["yogurts", "jogurti"] },
  { key: "chipSalads", Icon: Salad, labels: ["salads", "solate"] },
  { key: "chipPastries", Icon: Croissant, labels: ["pastries", "pecivo"] },
];

export const ExtraIcon = Plus;
export const SmallIcon = Minus;

// Append a food line. Always starts a new line.
export function appendFoodLine(draft: string, label: string): string {
  const trimmed = draft.replace(/[ \t]+$/g, "");
  const sep = trimmed.length === 0 || trimmed.endsWith("\n") ? "" : "\n";
  return `${trimmed}${sep}- ${label}`;
}

// Apply +/- modifier to the LAST line that looks like a food bullet ("- ...").
// If none exists, return draft unchanged.
export function applyModifier(draft: string, sign: "+" | "-"): string {
  const lines = draft.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/^(\s*-\s+.+?)(\s*[+\-])?\s*$/);
    if (m && m[1].trim().length > 2) {
      lines[i] = `${m[1].trimEnd()} ${sign}`;
      return lines.join("\n");
    }
  }
  return draft;
}

// Parse a line. Returns chip + modifier if it matches a known food bullet.
export function parseLine(line: string):
  | { kind: "food"; chip: FoodChip; label: string; modifier: "+" | "-" | null }
  | { kind: "bullet"; text: string }
  | { kind: "text"; text: string } {
  const bullet = line.match(/^\s*-\s+(.+?)\s*$/);
  if (bullet) {
    const inner = bullet[1];
    const mod = inner.match(/^(.+?)\s+([+\-])\s*$/);
    const core = (mod ? mod[1] : inner).trim();
    const modifier = (mod ? mod[2] : null) as "+" | "-" | null;
    const lc = core.toLowerCase();
    const chip = FOOD_CHIPS.find((c) => c.labels.includes(lc));
    if (chip) return { kind: "food", chip, label: core, modifier };
    return { kind: "bullet", text: inner };
  }
  return { kind: "text", text: line };
}

export function RenderedMessage({
  body,
  className,
  iconSize = "h-3.5 w-3.5",
}: {
  body: string;
  className?: string;
  iconSize?: string;
}) {
  const lines = body.split("\n");
  return (
    <div className={className}>
      {lines.map((raw, i) => {
        const parsed = parseLine(raw);
        if (parsed.kind === "food") {
          const { chip, label, modifier } = parsed;
          const Icon = chip.Icon;
          return (
            <div key={i} className="flex items-center gap-1.5 leading-6">
              <Icon className={`${iconSize} shrink-0 text-muted-foreground`} />
              <span>{label}</span>
              {modifier === "+" && (
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/15 text-primary text-[11px] font-bold leading-none">+</span>
              )}
              {modifier === "-" && (
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-foreground text-[11px] font-bold leading-none">−</span>
              )}
            </div>
          );
        }
        if (parsed.kind === "bullet") {
          return (
            <div key={i} className="flex items-start gap-1.5 leading-6">
              <span className="text-muted-foreground">•</span>
              <span className="whitespace-pre-wrap break-words">{parsed.text}</span>
            </div>
          );
        }
        if (parsed.text === "") return <div key={i} className="h-2" />;
        return (
          <div key={i} className="whitespace-pre-wrap break-words leading-6">
            {parsed.text}
          </div>
        );
      })}
    </div>
  );
}
