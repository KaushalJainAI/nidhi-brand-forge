import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { combosAPI } from "@/lib/api";

const Combos = () => {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await combosAPI.getAll();
        // Backend now returns flat list OR results object
        const comboList = data.results || data || [];
        setCombos(comboList);
      } catch (err: any) {
        console.error("Failed to fetch combos:", err);
        setError(err.message || "Failed to load combos");
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  const formatCombo = (combo: any) => ({
    id: Number(combo.id),
    name: combo.display_title || combo.name,
    image: combo.image,
    price: combo.final_price || combo.price,
    originalPrice: combo.discount_price ? combo.price : combo.total_original_price,
    weight: combo.total_weight || "",
    badge: combo.badge || "Combo",
    itemType: "combo" as const,
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-10 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">
            Special Combo Offers
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Save more with our carefully curated spice bundles and collections
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading amazing combos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">
              <p>{error}</p>
            </div>
          ) : combos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>No combo offers available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8 max-w-7xl mx-auto">
              {combos.map((combo) => (
                <ProductCard key={combo.id} {...formatCombo(combo)} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Combos;
