/**
 * Client-side mirror of the backend bounds (Backend/spices_backend/limits.py).
 *
 * These are the FIRST line of defence (better UX — stop bad input before a round
 * trip); the backend remains the authoritative guard. Keep the defaults in sync
 * with the backend; both are overridable per-environment (Vite VITE_* here).
 */
function intEnv(name: string, fallback: number): number {
  const raw = (import.meta.env as Record<string, string | undefined>)[name];
  const n = raw != null ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function numberEnv(name: string, fallback: number): number {
  const raw = (import.meta.env as Record<string, string | undefined>)[name];
  const n = raw != null ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const MAX_ITEM_QUANTITY = intEnv("VITE_MAX_ITEM_QUANTITY", 100);
export const MAX_CART_ITEMS = intEnv("VITE_MAX_CART_ITEMS", 50);
export const MAX_REVIEW_COMMENT = intEnv("VITE_MAX_REVIEW_COMMENT", 2000);
export const SHIPPING_CHARGE = numberEnv("VITE_SHIPPING_CHARGE", 69);
export const FREE_SHIPPING_THRESHOLD = numberEnv("VITE_FREE_SHIPPING_THRESHOLD", 500);

/** Clamp a quantity into [1, MAX_ITEM_QUANTITY]; non-finite -> 1. */
export function clampQuantity(q: number): number {
  if (!Number.isFinite(q)) return 1;
  return Math.max(1, Math.min(MAX_ITEM_QUANTITY, Math.floor(q)));
}
