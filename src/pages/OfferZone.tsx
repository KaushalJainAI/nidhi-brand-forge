import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const OfferZone = () => {
  const offerProducts = [
    { id: "1", name: "Garadu Masala", image: product1, price: 120, originalPrice: 150, badge: "30% OFF", weight: "100g" },
    { id: "2", name: "Kitchen King Masala", image: product2, price: 135, originalPrice: 170, badge: "20% OFF", weight: "100g" },
    { id: "3", name: "Pav Bhaji Masala", image: product3, price: 125, originalPrice: 155, badge: "19% OFF", weight: "100g" },
    { id: "4", name: "Sambhar Masala", image: product4, price: 130, originalPrice: 160, badge: "19% OFF", weight: "100g" },
    { id: "5", name: "Tea Masala", image: product5, price: 95, originalPrice: 120, badge: "21% OFF", weight: "50g" },
    { id: "6", name: "Chana Masala", image: product1, price: 115, originalPrice: 145, badge: "21% OFF", weight: "100g" },
    { id: "7", name: "Garam Masala", image: product2, price: 140, originalPrice: 175, badge: "20% OFF", weight: "100g" },
    { id: "8", name: "Biryani Masala", image: product3, price: 150, originalPrice: 185, badge: "19% OFF", weight: "100g" },
  ];

  const comboOffers = [
    {
      id: "combo-1",
      title: "Festival Special Combo",
      description: "Get 5 masalas at 40% off",
      price: 450,
      originalPrice: 750,
      badge: "COMBO DEAL"
    },
    {
      id: "combo-2",
      title: "Kitchen Essential Pack",
      description: "3 must-have masalas bundle",
      price: 320,
      originalPrice: 450,
      badge: "BEST VALUE"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-accent to-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Exclusive Offers
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Amazing deals and discounts on premium spices and masalas
          </p>
        </div>
      </section>

      {/* Limited Time Offers Banner */}
      <section className="py-8 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="default" className="text-lg px-6 py-2">
              🔥 Limited Time Offers
            </Badge>
            <span className="text-muted-foreground">|</span>
            <span className="text-foreground font-semibold">Up to 30% OFF</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-foreground font-semibold">Free Shipping on orders above ₹500</span>
          </div>
        </div>
      </section>

      {/* Combo Offers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Combo Offers</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {comboOffers.map((combo) => (
              <div key={combo.id} className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <Badge className="mb-4">{combo.badge}</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-2">{combo.title}</h3>
                <p className="text-muted-foreground mb-6">{combo.description}</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-primary">₹{combo.price}</span>
                  <span className="text-xl text-muted-foreground line-through">₹{combo.originalPrice}</span>
                  <Badge variant="secondary">
                    {Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100)}% OFF
                  </Badge>
                </div>
                <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-semibold transition-colors">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold mb-8 text-center">Hot Deals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfferZone;
