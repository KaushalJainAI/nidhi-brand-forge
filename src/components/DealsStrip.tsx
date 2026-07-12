import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductCarousel, { type CarouselProductItem } from "@/components/ProductCarousel";

interface DealsStripProps {
  title: string;
  subtitle?: string;
  items: CarouselProductItem[];
}

/** Milliseconds remaining until local midnight — the "deal resets daily" clock. */
const msUntilEndOfDay = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime() - now.getTime();
};

const fmt = (n: number) => String(n).padStart(2, "0");

/**
 * Swiggy "Deals of the Day" band: warm gradient header with a live countdown,
 * then a horizontally-scrolling carousel of the supplied items.
 * Renders nothing when there are no items, so it's safe to drop on any page.
 */
const DealsStrip = ({ title, subtitle, items }: DealsStripProps) => {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(msUntilEndOfDay());

  useEffect(() => {
    const id = setInterval(() => setRemaining(msUntilEndOfDay()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!items?.length) return null;

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  // The timer runs to midnight tonight — say so, rather than showing a bare
  // clock with no date to anchor it.
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const deadlineLabel = endOfDay.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-2 sm:px-4">
        <div
          className="relative overflow-hidden rounded-lg p-4 text-white shadow-xl sm:p-6"
          style={{ background: "var(--gradient-offer)" }}
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full text-white/14"
            viewBox="0 0 1100 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M-75 304 C 117 161 278 383 461 245 S 793 82 1177 179" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round" />
            <path d="M879 34 C 911 82 958 90 1014 65 C 994 118 1011 163 1057 197 C 1000 194 960 221 939 274 C 925 217 892 185 834 178 C 887 149 904 101 879 34Z" fill="currentColor" opacity=".7" />
          </svg>
          <div className="relative flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-5">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-3xl font-extrabold flex items-center gap-2">
                <Zap className="h-5 w-5 sm:h-7 sm:w-7 fill-current" />
                {title}
              </h2>
              {subtitle && <p className="text-white/90 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur notranslate">
                <span className="hidden sm:inline mr-1">{t('flashSale.endsIn')}</span>
                <span className="bg-white/20 rounded-lg px-2 py-1 tabular-nums">{fmt(h)}</span>:
                <span className="bg-white/20 rounded-lg px-2 py-1 tabular-nums">{fmt(m)}</span>:
                <span className="bg-white/20 rounded-lg px-2 py-1 tabular-nums">{fmt(s)}</span>
              </div>
              {/* A bare ticking clock reads as fake urgency; name the deadline. */}
              <span className="text-[11px] text-white/85 sm:text-xs notranslate">
                {t('flashSale.endsOn', { date: deadlineLabel })}
              </span>
            </div>
          </div>
          <div className="relative rounded-lg bg-background/96 p-3 shadow-inner sm:p-4">
            <ProductCarousel items={items} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsStrip;
