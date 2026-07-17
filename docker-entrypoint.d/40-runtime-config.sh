#!/bin/sh
# Generate the SPA runtime config (window.APP_CONFIG) from container env vars.
# This runs on every container start (nginx:alpine executes /docker-entrypoint.d/*.sh),
# so these values are controlled by the server's env — no image rebuild required.
# Empty values make the app fall back to the build-time VITE_* baked by Vite.
#
# API_URL stays /api (relative) so requests are same-origin on EVERY domain the
# image serves — that is what lets the SameSite=Lax auth cookies ride along.
# Do NOT set it to an absolute URL, or auth breaks on every other domain.
set -e

cat > /usr/share/nginx/html/config.js <<EOF
window.APP_CONFIG = {
  API_URL: "${API_URL:-/api}",
  GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID:-}",
  SHIPPING_CHARGE: "${SHIPPING_CHARGE:-}",
  FREE_SHIPPING_THRESHOLD: "${FREE_SHIPPING_THRESHOLD:-}",
  DEFAULT_TAX_RATE: "${DEFAULT_TAX_RATE:-}",
  MAX_ONLINE_ORDER_TOTAL: "${MAX_ONLINE_ORDER_TOTAL:-}",
  MAX_ITEM_QUANTITY: "${MAX_ITEM_QUANTITY:-}",
  MAX_CART_ITEMS: "${MAX_CART_ITEMS:-}",
  MAX_REVIEW_COMMENT: "${MAX_REVIEW_COMMENT:-}"
};
EOF

echo "[runtime-config] API_URL=${API_URL:-/api} SHIPPING_CHARGE=${SHIPPING_CHARGE:-<baked>} FREE_SHIPPING_THRESHOLD=${FREE_SHIPPING_THRESHOLD:-<baked>}"
