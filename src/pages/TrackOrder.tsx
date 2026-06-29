import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Truck, Headphones } from "lucide-react";

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setOrderId(id);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Track order logic here
  };

  // Static illustrative journey; the order currently sits at the "In Transit" step.
  const steps = [
    { icon: "📦", label: "Order Placed", desc: "Confirmed" },
    { icon: "🎁", label: "Packed", desc: "Hand-packed" },
    { icon: "🚚", label: "In Transit", desc: "On the way" },
    { icon: "🏠", label: "Delivered", desc: "At your door" },
  ];
  const activeIndex = 2;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--backdrop-spice)" }} aria-hidden />
        <span aria-hidden className="pointer-events-none absolute left-[9%] top-[30%] text-4xl sm:text-5xl animate-float" style={{ ["--rot" as string]: "-10deg" }}>🚚</span>
        <span aria-hidden className="pointer-events-none absolute right-[10%] top-[26%] text-3xl sm:text-5xl animate-float" style={{ ["--rot" as string]: "10deg", animationDelay: "0.9s" }}>📦</span>
        <div className="relative container mx-auto px-4 py-12 sm:py-20 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/70 px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
              <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Real-time order updates
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Track Your{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Order
              </span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-lg text-muted-foreground">
              Enter your order ID to see exactly where your spices are.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-8 sm:py-14">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-3xl shadow-card border border-border p-6 sm:p-8 relative animate-fade-in-up">
            <div className="flex justify-center mb-5 sm:mb-6">
              <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-[var(--shadow-elegant)]">
                <Package className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-foreground mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your order ID"
                    className="pl-10 h-11 rounded-xl"
                    required
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  You can find your order ID in the confirmation email
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full h-12 rounded-full active-press">
                Track Order
              </Button>
            </form>

            <div className="mt-7 pt-6 border-t border-border text-center">
              <h3 className="font-semibold text-foreground mb-1.5 flex items-center justify-center gap-2">
                <Headphones className="h-4 w-4 text-primary" /> Need Help?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Having trouble tracking your order? Our team is happy to help.
              </p>
              <Button
                variant="outline"
                className="w-full rounded-full border-primary text-primary hover:bg-primary/5 active-press"
                onClick={() => navigate("/contact")}
              >
                Contact Support
              </Button>
            </div>
          </div>

          {/* Order journey — connected, animated progress tracker */}
          <div className="mt-8 sm:mt-12 bg-card rounded-3xl border border-border shadow-card p-5 sm:p-8">
            <h3 className="font-semibold text-foreground mb-8 text-center">
              How your order travels to you
            </h3>
            <div className="flex items-start justify-between relative">
              {/* connecting rail (track) */}
              <div className="absolute left-6 right-6 top-6 h-1.5 -translate-y-1/2 bg-border rounded-full" />
              {/* connecting rail (progress fill) */}
              <div
                className="absolute left-6 top-6 h-1.5 -translate-y-1/2 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `calc((100% - 3rem) * ${activeIndex / (steps.length - 1)})` }}
              />
              {steps.map((step, i) => {
                const done = i < activeIndex;
                const live = i === activeIndex;
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`h-12 w-12 rounded-full grid place-items-center text-xl border-2 transition-all duration-300 ${
                        done
                          ? "bg-gradient-to-br from-primary to-accent border-transparent text-white shadow-[var(--shadow-elegant)]"
                          : live
                          ? "bg-gradient-to-br from-primary to-accent border-transparent text-white shadow-[var(--shadow-elegant)] animate-pulse-subtle"
                          : "bg-muted border-border"
                      }`}
                    >
                      {done ? "✓" : step.icon}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-semibold text-center ${
                        done || live ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground text-center hidden sm:block">
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackOrder;
