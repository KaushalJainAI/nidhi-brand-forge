import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Award,
  Users,
  Heart,
  Leaf,
  Sprout,
  Flame,
  PackageCheck,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import spicesImage from "@/assets/spices-hero.jpg";

type TimelineItem = { year: string; title: string; text: string };
type TextItem = { title: string; text: string };
type ValueItem = { title: string; description: string };
type StatLabel = { label: string };

/* Count-up number that animates when scrolled into view. */
const CountUp = ({
  end,
  decimals = 0,
  suffix = "",
  duration = 1800,
}: {
  end: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(end * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setValue(end);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/* Self-drawing vertical line for the journey timeline. */
const TimelineLine = ({ className }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={cn("draw-line", visible && "is-visible", className)} />;
};

const floatingSpices = [
  { emoji: "🌶️", className: "left-[6%] top-[18%]", rot: "-12deg", delay: "0s", size: "text-4xl sm:text-6xl" },
  { emoji: "🧄", className: "right-[8%] top-[22%]", rot: "10deg", delay: "0.8s", size: "text-3xl sm:text-5xl" },
  { emoji: "🟡", className: "left-[14%] bottom-[16%]", rot: "6deg", delay: "1.4s", size: "text-3xl sm:text-5xl" },
  { emoji: "🍃", className: "right-[14%] bottom-[20%]", rot: "-8deg", delay: "0.4s", size: "text-3xl sm:text-5xl" },
  { emoji: "✨", className: "left-[44%] top-[10%]", rot: "0deg", delay: "1.1s", size: "text-2xl sm:text-4xl" },
];

const About = () => {
  const { t } = useTranslation();

  // Icons stay in code; all copy comes from i18n (about.*).
  const valueIcons = [
    <Award className="h-6 w-6 sm:h-7 sm:w-7" />,
    <Users className="h-6 w-6 sm:h-7 sm:w-7" />,
    <Heart className="h-6 w-6 sm:h-7 sm:w-7" />,
    <Leaf className="h-6 w-6 sm:h-7 sm:w-7" />,
  ];
  const processIcons = [
    <Sprout className="h-6 w-6 sm:h-7 sm:w-7" />,
    <Flame className="h-6 w-6 sm:h-7 sm:w-7" />,
    <Leaf className="h-6 w-6 sm:h-7 sm:w-7" />,
    <PackageCheck className="h-6 w-6 sm:h-7 sm:w-7" />,
  ];

  const values = t("about.values", { returnObjects: true }) as ValueItem[];
  const timeline = t("about.timeline", { returnObjects: true }) as TimelineItem[];
  const process = t("about.process", { returnObjects: true }) as TextItem[];
  const statLabels = t("about.stats", { returnObjects: true }) as StatLabel[];

  const statNodes = [
    <CountUp end={50} suffix="+" />,
    <CountUp end={1.1} decimals={1} suffix="M+" />,
    <CountUp end={100} suffix="%" />,
    <CountUp end={30} suffix="+" />,
  ];
  const stats = statNodes.map((node, i) => ({ node, label: statLabels[i]?.label ?? "" }));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* ===== Cinematic intro ===== */}
      <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden">
        {/* drifting warm backdrop */}
        <div
          className="absolute inset-0 animate-gradient-pan"
          style={{
            background:
              "linear-gradient(135deg, hsl(35 45% 94%) 0%, hsl(35 25% 97%) 40%, hsl(40 60% 92%) 100%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{ background: "var(--backdrop-spice)" }} aria-hidden />
        {/* decorative slow-spinning ring */}
        <div
          className="absolute left-1/2 top-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 animate-spin-slow"
          aria-hidden
        />
        {/* floating spices */}
        {floatingSpices.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className={cn("pointer-events-none absolute animate-float select-none drop-shadow", s.className, s.size)}
            style={{ ["--rot" as string]: s.rot, animationDelay: s.delay }}
          >
            {s.emoji}
          </span>
        ))}

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/70 px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
              {t("about.badge")}
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-5 text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              {t("about.heroPre")}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {t("about.heroHighlight")}
              </span>
              {t("about.heroPost")}
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-5 max-w-xl text-sm sm:text-lg text-muted-foreground">
              {t("about.heroSubtitle")}
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full active-press">
                <Link to="/products">
                  {t("about.heroCta")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-primary/70">
          <ChevronDown className="h-6 w-6 animate-bounce" aria-hidden />
        </div>
      </section>

      {/* ===== The beginning ===== */}
      <section className="py-12 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-14 items-center">
            <Reveal variant="left">
              <div className="relative">
                <div className="absolute inset-0 -rotate-6 rounded-3xl bg-gradient-to-br from-primary/25 to-accent/25" />
                <img
                  src={spicesImage}
                  alt="Traditional Indian spices"
                  className="relative w-full rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-5 -right-2 sm:-right-5 rounded-2xl bg-card px-4 py-3 shadow-card border border-border">
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary leading-none">
                    <CountUp end={30} suffix="+" />
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">{t("about.heritageLabel")}</p>
                </div>
              </div>
            </Reveal>
            <Reveal variant="right">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                {t("about.beginEyebrow")}
              </span>
              <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-foreground">
                {t("about.beginTitle")}
              </h2>
              <div className="mt-4 space-y-4 text-sm sm:text-base text-muted-foreground">
                <p>{t("about.beginP1")}</p>
                <p>{t("about.beginP2")}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== Journey timeline ===== */}
      <section className="py-12 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-10 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              {t("about.journeyEyebrow")}
            </span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-foreground">
              {t("about.journeyTitle")}
            </h2>
          </Reveal>

          <div className="relative mx-auto max-w-3xl">
            {/* central / left rail */}
            <TimelineLine className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary to-accent rounded-full" />

            <div className="space-y-8 sm:space-y-14">
              {timeline.map((item, i) => (
                <Reveal
                  key={i}
                  variant={i % 2 === 0 ? "left" : "right"}
                  className={cn(
                    "relative pl-12 sm:pl-0 sm:w-1/2",
                    i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12"
                  )}
                >
                  {/* node dot */}
                  <span
                    className={cn(
                      "absolute top-1 z-10 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-white shadow-[var(--shadow-elegant)] left-0 -translate-x-1/2 sm:left-auto",
                      i % 2 === 0 ? "sm:-right-4 sm:translate-x-1/2" : "sm:-left-4 sm:-translate-x-1/2"
                    )}
                    aria-hidden
                  >
                    ●
                  </span>
                  <div className="rounded-2xl bg-card border border-border shadow-card p-4 sm:p-6 hover-lift">
                    <span className="text-sm font-extrabold text-primary">{item.year}</span>
                    <h3 className="mt-0.5 text-base sm:text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Farm to kitchen process ===== */}
      <section className="py-12 sm:py-24">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-10 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              {t("about.processEyebrow")}
            </span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-foreground">
              {t("about.processTitle")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {process.map((step, i) => (
              <Reveal key={i} variant="up" delay={i * 120}>
                <div className="group relative h-full rounded-2xl bg-card border border-border shadow-card p-4 sm:p-6 hover-lift-lg">
                  <span className="absolute right-4 top-3 text-4xl sm:text-5xl font-extrabold text-primary/10">
                    {i + 1}
                  </span>
                  <div className="mb-3 grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-[var(--shadow-elegant)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    {processIcons[i]}
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Values ===== */}
      <section className="py-12 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-10 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              {t("about.valuesEyebrow")}
            </span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-foreground">{t("about.valuesTitle")}</h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {values.map((value, i) => (
              <Reveal key={i} variant="scale" delay={i * 100}>
                <div className="group h-full text-center p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-card hover-lift active-press">
                  <div className="mx-auto mb-3 sm:mb-4 grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-[var(--shadow-elegant)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    {valueIcons[i]}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-lg">
                    {value.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <Reveal variant="scale">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-6 sm:p-14 shadow-[var(--shadow-lift)]">
              <div className="absolute inset-0 opacity-20" style={{ background: "var(--backdrop-spice)" }} aria-hidden />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                {stats.map((stat, i) => (
                  <div key={i} className="text-white">
                    <div className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-none">
                      {stat.node}
                    </div>
                    <div className="mt-2 text-white/85 text-xs sm:text-base">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Closing CTA ===== */}
      <section className="pb-12 sm:pb-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 sm:p-10 text-center sm:text-left">
              <div>
                <h3 className="text-xl sm:text-3xl font-bold text-foreground">
                  {t("about.ctaTitle")}
                </h3>
                <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                  {t("about.ctaSubtitle")}
                </p>
              </div>
              <Button asChild size="lg" className="rounded-full active-press shrink-0">
                <Link to="/products">
                  {t("about.ctaButton")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
