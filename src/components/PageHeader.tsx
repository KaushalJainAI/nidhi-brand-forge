import { ReactNode } from "react";

interface PageHeaderProps {
  /** Main heading text. */
  title: string;
  /** Supporting line under the title; accepts JSX for dynamic content. */
  subtitle?: ReactNode;
  /** Small uppercase eyebrow label above the title. */
  kicker?: string;
  /** Optional icon shown in a circular spice-backdrop above the kicker. */
  icon?: ReactNode;
}

/**
 * Shared page banner used at the top of secondary pages (Products, About,
 * policies, etc.). Warm gradient with decorative blurred spice blobs, an
 * eyebrow kicker, an accent divider and an optional icon — replaces the old
 * flat pastel band for a consistent, branded look across the site.
 */
const PageHeader = ({ title, subtitle, kicker, icon }: PageHeaderProps) => (
  <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/10">
    {/* Decorative blobs */}
    <div className="pointer-events-none absolute -top-16 -left-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 -right-12 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />

    <div className="container mx-auto px-4 py-8 sm:py-12 text-center relative">
      {icon && (
        <div className="mx-auto mb-3 h-14 w-14 rounded-full spice-backdrop grid place-items-center text-primary shadow-sm">
          {icon}
        </div>
      )}
      {kicker && (
        <span className="inline-block bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3">
          {kicker}
        </span>
      )}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
        {title}
      </h1>
      <div
        className="mx-auto mt-3 mb-3 h-1 w-16 rounded-full"
        style={{ background: "var(--gradient-offer)" }}
      />
      {subtitle && (
        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  </section>
);

export default PageHeader;
