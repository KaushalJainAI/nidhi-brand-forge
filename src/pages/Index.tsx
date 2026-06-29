import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCarousel from "@/components/ProductCarousel";
import DealsStrip from "@/components/DealsStrip";
import VideoStorySection from "@/components/VideoStorySection";
import PromoCouponStrip from "@/components/PromoCouponStrip";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, Clock, Award, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { productsAPI, categoriesAPI, combosAPI } from "@/lib/api";
import { searchAPI } from "@/lib/api/search";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface ProductData {
  id: number;
  name: string;
  image: string;
  price: number;
  final_price?: number;
  discount_price?: number;
  weight?: number;
  unit?: string;
  badge?: string;
}

interface SectionData {
  id: number;
  name: string;
  slug: string;
  section_type: string;
  products: ProductData[];
  combos: any[];
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [recommended, setRecommended] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const features = [
    { icon: <Truck className="h-5 w-5 sm:h-8 sm:w-8" />, title: t('home.features.freeShippingTitle'), description: t('home.features.freeShippingDesc') },
    { icon: <Shield className="h-5 w-5 sm:h-8 sm:w-8" />, title: t('home.features.authenticTitle'), description: t('home.features.authenticDesc') },
    { icon: <Clock className="h-5 w-5 sm:h-8 sm:w-8" />, title: t('home.features.deliveryTitle'), description: t('home.features.deliveryDesc') },
    { icon: <Award className="h-5 w-5 sm:h-8 sm:w-8" />, title: t('home.features.qualityTitle'), description: t('home.features.qualityDesc') },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Products/combos/sections endpoints return plain arrays (pagination_class = None);
        // categories is DRF-paginated ({ results }).
        const [sectionsRes, categoriesRes, combosRes, productsRes] = await Promise.all([
          productsAPI.getSections().catch(() => []),
          categoriesAPI.getAll().catch(() => ({ results: [] })),
          combosAPI.getAll().catch(() => []),
          productsAPI.getAll().catch(() => []),
        ]);

        // /products/sections/ may return a plain array or a DRF-style { results }
        // envelope depending on backend version; normalise to an array either way.
        setSections(Array.isArray(sectionsRes) ? sectionsRes : ((sectionsRes as any)?.results || []));
        setCategories(categoriesRes.results || []);
        setCombos(combosRes || []);
        setAllProducts(productsRes || []);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Personalized row — logged-in users only. Falls back silently to hidden
  // when the user has no signal yet or the request fails.
  useEffect(() => {
    if (!isLoggedIn) {
      setRecommended([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await searchAPI.getRecommendations(12, "home");
      if (!cancelled) setRecommended((res.products as unknown as ProductData[]) || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const formatProduct = (product: ProductData, index: number) => ({
    id: Number(product.id),
    name: product.name,
    image: product.image,
    price: product.final_price || product.discount_price || product.price,
    originalPrice: product.discount_price ? product.price : undefined,
    weight: product.weight ? `${product.weight}${product.unit || 'g'}` : "",
    badge: product.badge,
    itemType: "product" as const,
    variantCount: (product as any).variant_count ?? 1,
  });

  const formatCombo = (combo: any, index: number) => ({
    id: Number(combo.id),
    name: combo.display_title || combo.name,
    image: combo.image,
    price: combo.final_price || combo.discount_price || combo.price,
    originalPrice: combo.discount_price ? combo.price : combo.total_original_price,
    weight: combo.total_weight || "",
    badge: combo.badge || "",
    itemType: "combo" as const,
  });

  const handleCategoryClick = (category: CategoryData) => {
    navigate(`/products?category=${category.id}`);
  };

  // Get section products or fallback. Rows now scroll horizontally, so we keep
  // every product the API returns instead of capping at 4.
  const getSectionProducts = (sectionType: string) => {
    const section = sections.find(s => s.section_type === sectionType);
    if (section?.products?.length) {
      return section.products.map((p, i) => formatProduct(p, i));
    }
    // Fallback to all products with filtering
    return allProducts.slice(0, 12).map((p, i) => formatProduct(p, i));
  };

  // Backend recommendation rows arrive in the search-product shape (price is
  // already the final price, with original_price for the strikethrough).
  const formatRecommended = (product: any) => ({
    id: Number(product.id),
    name: product.name,
    image: product.image,
    price: product.price,
    originalPrice: product.original_price && product.original_price > product.price
      ? product.original_price
      : undefined,
    weight: product.weight ? `${product.weight}${product.unit || 'g'}` : "",
    badge: product.is_featured ? "Featured" : undefined,
    itemType: "product" as const,
  });

  const newlyLaunched = getSectionProducts("new");
  const specials = getSectionProducts("special");
  const bestSellers = getSectionProducts("bestseller");
  const trending = getSectionProducts("trending");
  const recommendedForYou = recommended.map(formatRecommended);

  const formattedCombos = combos.slice(0, 12).map((c, i) => formatCombo(c, i));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <main className="flex-grow">
        <HeroSection />

        {/* Recommended For You (personalized, logged-in users only) */}
        {recommendedForYou.length > 0 && (
          <section className="py-8 sm:py-10 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
            <div className="container mx-auto px-2 sm:px-4">
              <div className="mb-4">
                <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-primary font-semibold mb-1">{t('home.eyebrow.forYou')}</div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">{t('home.recommended.title')}</h2>
                <p className="text-xs sm:text-base text-muted-foreground">{t('home.recommended.subtitle')}</p>
              </div>
              <ProductCarousel items={recommendedForYou} />
            </div>
          </section>
        )}

        {/* Newly Launched */}
        {newlyLaunched.length > 0 && (
          <section className="py-8 sm:py-10 bg-muted/30">
            <div className="container mx-auto px-2 sm:px-4">
              <div className="mb-4">
                <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-primary font-semibold mb-1">{t('home.eyebrow.justIn')}</div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">{t('home.new.title')}</h2>
                <p className="text-xs sm:text-base text-muted-foreground">{t('home.new.subtitle')}</p>
              </div>
              <ProductCarousel items={newlyLaunched} />
            </div>
          </section>
        )}

        <VideoStorySection />

        {/* Our Specials — presented as a Swiggy-style "Deals of the Day" strip */}
        <DealsStrip
          title={t('home.specials.title')}
          subtitle={t('home.specials.subtitle')}
          items={specials}
        />

        {/* Best Selling Products */}
        {bestSellers.length > 0 && (
          <section className="py-10 sm:py-12">
            <div className="container mx-auto px-2 sm:px-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
                <div>
                  <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-primary font-semibold mb-1">{t('home.eyebrow.bestsellers')}</div>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">
                    {t('home.bestsellers.title')}
                  </h2>
                  <p className="text-xs sm:text-base text-muted-foreground">{t('home.bestsellers.subtitle')}</p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto hidden sm:flex" asChild>
                  <Link to="/products">
                    {t('common.viewAll')}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
              <ProductCarousel items={bestSellers} />
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-7 sm:py-12 bg-muted/30">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {features.map((feature, index) => (
                <div key={index} className="group flex flex-col items-center text-center p-3 sm:p-5 bg-card rounded-lg border border-border/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full spice-backdrop grid place-items-center text-primary mb-2 sm:mb-4 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">{feature.icon}</div>
                  <h3 className="font-semibold text-xs sm:text-base text-foreground mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending */}
        {trending.length > 0 && (
          <section className="py-8 sm:py-10">
            <div className="container mx-auto px-2 sm:px-4">
              <div className="mb-4">
                <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-primary font-semibold mb-1">{t('home.eyebrow.trending')}</div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">{t('home.trending.title')}</h2>
                <p className="text-xs sm:text-base text-muted-foreground">{t('home.trending.subtitle')}</p>
              </div>
              <ProductCarousel items={trending} />
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="relative overflow-hidden py-9 sm:py-12 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-primary/10"
              viewBox="0 0 1200 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M-120 351 C 93 169 247 414 449 278 S 801 89 1329 226" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
            </svg>
            <div className="container relative mx-auto px-2 sm:px-4">
              <div className="text-center mb-6">
                <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-primary font-semibold mb-1">{t('home.eyebrow.explore')}</div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">{t('home.categories.title')}</h2>
                <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
                  {t('home.categories.subtitle')}
                </p>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 sm:gap-5 sm:overflow-visible sm:pb-0">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative flex w-28 shrink-0 flex-col items-center gap-2 overflow-hidden rounded-lg bg-card border border-border/80 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg sm:w-auto sm:p-5 sm:gap-3"
                  >
                    <span className="h-14 w-14 sm:h-20 sm:w-20 rounded-full spice-backdrop grid place-items-center overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="h-10 w-10 sm:h-16 sm:w-16 object-contain" />
                      ) : (
                        <span className="text-xl sm:text-3xl font-bold text-primary notranslate">{category.name.charAt(0)}</span>
                      )}
                    </span>
                    <h3 className="font-semibold text-xs sm:text-base text-foreground group-hover:text-primary transition-colors text-center line-clamp-2">
                      {category.name}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Combo Offers */}
        {formattedCombos.length > 0 && (
          <section className="py-8 sm:py-10">
            <div className="container mx-auto px-2 sm:px-4">
              <div className="text-center mb-5">
                <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-primary font-semibold mb-1">{t('home.eyebrow.valueBundles')}</div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {t('home.combos.title')}
                </h2>
                <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
                  {t('home.combos.subtitle')}
                </p>
              </div>
              <ProductCarousel items={formattedCombos} />
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-7 sm:py-10">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-primary font-semibold mb-1">{t('home.eyebrow.lovedByKitchens')}</div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">{t('home.testimonials.title')}</h2>
              <p className="text-xs sm:text-base text-muted-foreground">{t('home.testimonials.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
              {(t('home.testimonials.items', { returnObjects: true }) as { name: string; review: string; rating: number }[]).map((testimonial, index) => (
                <div key={index} className="bg-card rounded-lg p-4 sm:p-6 border border-border/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex mb-2 sm:mb-4 text-accent">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-accent text-sm sm:text-base">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-base mb-3 sm:mb-4">"{testimonial.review}"</p>
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full spice-backdrop grid place-items-center font-bold text-primary text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                    <p className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-14">
          <div className="container mx-auto px-3 sm:px-4">
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-12 sm:px-10 sm:py-16 text-center text-primary-foreground shadow-xl"
              style={{ background: "var(--gradient-offer)" }}
            >
              <div className="relative">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full mb-3 sm:mb-4">
                  {t('home.cta.handPacked')}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 sm:mb-3">
                  {t('home.cta.title')}
                </h2>
                <p className="text-sm sm:text-lg text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  {t('home.cta.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto rounded-full bg-background text-primary font-bold shadow-lg hover:bg-background/90 active-press"
                    asChild
                  >
                    <Link to="/products" className="flex items-center justify-center">
                      {t('common.shopNow')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-2 border-white/70 bg-transparent text-primary-foreground font-bold hover:bg-white/15 hover:text-primary-foreground active-press"
                    asChild
                  >
                    <Link to="/offer-zone" className="flex items-center justify-center">
                      {t('home.cta.viewOffers')}
                    </Link>
                  </Button>
                </div>

                {/* Trust chips */}
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 sm:mt-8 text-xs sm:text-sm text-primary-foreground/90">
                  <span className="flex items-center gap-1.5">{t('trust.freeShipping')}</span>
                  <span className="flex items-center gap-1.5">{t('trust.cod')}</span>
                  <span className="flex items-center gap-1.5">{t('trust.happyKitchens')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
