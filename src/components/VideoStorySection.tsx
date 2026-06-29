import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Play, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import spicesVideo from "@/assets/grok-video-2e290515-947f-4dd0-baca-4581ae53774a (1).mp4";

const VideoStorySection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden border-y border-border/70 bg-card py-8 sm:py-14">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-secondary/10"
        viewBox="0 0 1200 520"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M-132 377 C 70 199 246 442 436 294 S 768 95 1325 255" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
        <path d="M103 74 C 132 117 174 124 223 102 C 205 149 220 190 261 220 C 210 218 174 242 155 289 C 143 238 113 210 61 204 C 108 178 124 134 103 74Z" fill="currentColor" opacity=".65" />
      </svg>
      <div className="container relative mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-5 sm:gap-8 items-center">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border shadow-2xl">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src={spicesVideo}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-foreground/30 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-lg backdrop-blur">
              <Play className="h-3.5 w-3.5 fill-primary text-primary" />
              {t('ourStory.eyebrow')}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="text-xs tracking-[0.25em] uppercase text-primary font-semibold">{t('ourStory.label')}</div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {t('ourStory.heading')}
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
              {t('ourStory.body')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <ShieldCheck className="mb-2 h-5 w-5 text-secondary" />
                <p className="text-sm font-bold text-foreground">{t('ourStory.feature1Title')}</p>
                <p className="text-xs text-muted-foreground">{t('ourStory.feature1Desc')}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <Timer className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-bold text-foreground">{t('ourStory.feature2Title')}</p>
                <p className="text-xs text-muted-foreground">{t('ourStory.feature2Desc')}</p>
              </div>
            </div>
            <Button asChild size="lg" className="group rounded-full shadow-lg shadow-primary/30 hover:brightness-110 active-press">
              <Link to="/products" className="flex items-center">
                {t('ourStory.cta')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoStorySection;
