import { useTranslation } from "react-i18next";

/**
 * Slim auto-scrolling ribbon of brand USPs shown above the navbar.
 * Pure presentation — no state, no data. Pauses on hover (see .marquee-track).
 */
const UspRibbon = () => {
  const { t } = useTranslation();

  // Falls back to English copy when a translation key is missing.
  const items = [
    `🚚 ${t("ribbon.freeShipping")}`,
    `🌿 ${t("ribbon.pure")}`,
    `🏠 ${t("ribbon.handPacked")}`,
    `⭐ ${t("ribbon.trusted")}`,
  ];

  // Rendered twice back-to-back so the -50% translate loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="bg-primary text-primary-foreground text-[11px] sm:text-xs overflow-hidden">
      <div className="marquee-track py-1.5">
        {loop.map((text, i) => (
          <span key={i} className="px-6 sm:px-8 notranslate">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default UspRibbon;
