import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Render a product weight for display: "100.00" + "g" -> "100g".
 *
 * The API serialises weight as a DecimalField, so it arrives as "100.00".
 * Interpolating it directly produced "100.00g" everywhere. Mirrors the
 * backend's Product.formatted_weight (trailing zeros stripped, unit appended).
 */
export function formatWeight(
  weight: string | number | null | undefined,
  unit?: string | null,
  fallback = "",
): string {
  if (weight === null || weight === undefined || weight === "") return fallback;

  const n = typeof weight === "number" ? weight : parseFloat(weight);
  if (!Number.isFinite(n)) return fallback;

  // 100.00 -> "100", 12.50 -> "12.5"
  const value = Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(2)));
  return `${value}${unit || "g"}`;
}
