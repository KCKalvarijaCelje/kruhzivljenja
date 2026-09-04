import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { W as Wheat, k as Sandwich, A as Apple, l as Carrot, B as Beef, m as Cake, n as Milk, o as CupSoda, p as Salad, q as Croissant } from "../_libs/lucide-react.mjs";
const FOOD_CHIPS = [
  { key: "chipBread", Icon: Wheat, labels: ["bread", "kruh"] },
  { key: "chipSandwiches", Icon: Sandwich, labels: ["sandwiches", "sendviči"] },
  { key: "chipFruit", Icon: Apple, labels: ["fruit", "sadje"] },
  { key: "chipVegetables", Icon: Carrot, labels: ["vegetables", "zelenjava"] },
  { key: "chipMeat", Icon: Beef, labels: ["meat", "meso"] },
  { key: "chipDesserts", Icon: Cake, labels: ["desserts", "sladice"] },
  { key: "chipMilk", Icon: Milk, labels: ["milk", "mleko"] },
  { key: "chipYogurts", Icon: CupSoda, labels: ["yogurts", "jogurti"] },
  { key: "chipSalads", Icon: Salad, labels: ["salads", "solate"] },
  { key: "chipPastries", Icon: Croissant, labels: ["pastries", "pecivo"] }
];
function appendFoodLine(draft, label) {
  const trimmed = draft.replace(/[ \t]+$/g, "");
  const sep = trimmed.length === 0 || trimmed.endsWith("\n") ? "" : "\n";
  return `${trimmed}${sep}- ${label}`;
}
function applyModifier(draft, sign) {
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
function parseLine(line) {
  const bullet = line.match(/^\s*-\s+(.+?)\s*$/);
  if (bullet) {
    const inner = bullet[1];
    const mod = inner.match(/^(.+?)\s+([+\-])\s*$/);
    const core = (mod ? mod[1] : inner).trim();
    const modifier = mod ? mod[2] : null;
    const lc = core.toLowerCase();
    const chip = FOOD_CHIPS.find((c) => c.labels.includes(lc));
    if (chip) return { kind: "food", chip, label: core, modifier };
    return { kind: "bullet", text: inner };
  }
  return { kind: "text", text: line };
}
function RenderedMessage({
  body,
  className,
  iconSize = "h-3.5 w-3.5"
}) {
  const lines = body.split("\n");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: lines.map((raw, i) => {
    const parsed = parseLine(raw);
    if (parsed.kind === "food") {
      const { chip, label, modifier } = parsed;
      const Icon = chip.Icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 leading-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `${iconSize} shrink-0 text-muted-foreground` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
        modifier === "+" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/15 text-primary text-[11px] font-bold leading-none", children: "+" }),
        modifier === "-" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-foreground text-[11px] font-bold leading-none", children: "−" })
      ] }, i);
    }
    if (parsed.kind === "bullet") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5 leading-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "•" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap break-words", children: parsed.text })
      ] }, i);
    }
    if (parsed.text === "") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2" }, i);
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap break-words leading-6", children: parsed.text }, i);
  }) });
}
export {
  FOOD_CHIPS as F,
  RenderedMessage as R,
  appendFoodLine as a,
  applyModifier as b
};
