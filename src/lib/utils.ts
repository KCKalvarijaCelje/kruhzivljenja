import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Role-Based Identity Protection (Option 1 - Adaptive Privacy):
 * - Admin: Full Name (e.g. "Aleš Lajlar")
 * - Driver / Coordinator: First Name + Last Initial (e.g. "Aleš L.")
 * - Viewer / Public / Guest: First Name only (e.g. "Aleš")
 */
export type ViewerRoleContext = {
  isAdmin?: boolean;
  isDriver?: boolean;
  isCoordinator?: boolean;
  roles?: string[];
};

export function formatDisplayName(
  rawName: string | null | undefined,
  context?: ViewerRoleContext
): string {
  if (!rawName) return "";
  const name = rawName.trim();
  if (!name) return "";

  const isAdmin = Boolean(context?.isAdmin || context?.roles?.includes("admin"));
  const isWorker = Boolean(
    context?.isDriver ||
    context?.isCoordinator ||
    context?.roles?.includes("driver") ||
    context?.roles?.includes("coordinator")
  );

  // 1. Admin sees full name
  if (isAdmin) {
    return name;
  }

  // Split by whitespace
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const firstName = parts[0];

  // 2. Driver / Coordinator sees First Name + Last Initial (e.g. "Aleš L.")
  if (isWorker) {
    if (parts.length > 1) {
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    }
    return firstName;
  }

  // 3. Viewers / Guests / Public see First Name Only (e.g. "Aleš")
  return firstName;
}

