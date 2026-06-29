import { BadgePercent, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Coupon {
  code: string;
  title: string;
  subtitle: string;
}

interface PromoCouponStripProps {
  coupons?: Coupon[];
  compact?: boolean;
}

const PromoCouponStrip = ({ coupons, compact = false }: PromoCouponStripProps) => {
  const { t } = useTranslation();

  const defaultCoupons: Coupon[] = [
    { code: "NIDHI20", title: t('promo.flat20Title'), subtitle: t('promo.flat20Subtitle') },
    { code: "FREESHIP", title: t('promo.freeDeliveryTitle'), subtitle: t('promo.freeDeliverySubtitle') },
    { code: "COMBO15", title: t('promo.comboSaverTitle'), subtitle: t('promo.comboSaverSubtitle') },
  ];

  const items = coupons || defaultCoupons;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t('promo.copied', { code }));
    } catch {
      toast.error(t('promo.copyFailed'));
    }
  };

  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-3"}>
      {items.map((coupon, index) => (
        <button
          key={coupon.code}
          onClick={() => handleCopy(coupon.code)}
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary/35 bg-card p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg active-press sm:p-4"
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full text-primary opacity-100 transition-opacity group-hover:opacity-80"
            viewBox="0 0 360 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M-42 110 C 30 54 89 139 158 87 S 286 30 397 72" fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth="10" strokeLinecap="round" />
          </svg>
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                {index === 1 ? <Sparkles className="h-4 w-4" /> : <BadgePercent className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold uppercase text-primary sm:text-base">{coupon.title}</span>
                <span className="block text-xs text-muted-foreground">{coupon.subtitle}</span>
                <span className="mt-2 inline-flex rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold tracking-wide text-primary">
                  {coupon.code}
                </span>
              </span>
            </div>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Copy className="h-3.5 w-3.5" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PromoCouponStrip;
