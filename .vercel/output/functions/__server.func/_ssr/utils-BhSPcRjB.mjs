import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatDisplayName(rawName, context) {
  if (!rawName) return "";
  const name = rawName.trim();
  if (!name) return "";
  const isAdmin = Boolean(context?.isAdmin || context?.roles?.includes("admin"));
  const isWorker = Boolean(
    context?.isDriver || context?.isCoordinator || context?.roles?.includes("driver") || context?.roles?.includes("coordinator")
  );
  if (isAdmin) {
    return name;
  }
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const firstName = parts[0];
  if (isWorker) {
    if (parts.length > 1) {
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    }
    return firstName;
  }
  return firstName;
}
export {
  cn as c,
  formatDisplayName as f
};
