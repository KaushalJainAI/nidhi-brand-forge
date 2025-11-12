import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import MobileFooter from "@/components/MobileFooter";
import VideoStorySection from "@/components/VideoStorySection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const featuredProducts = [
  { id: "1", name: "Garadu Masala", image: product1, price: 120, originalPrice: 150, weight: "100g", badge: "Best Seller" },
  { id: "2", name: "Kitchen King Masala", image: product2, price: 135, originalPrice: 170, weight: "100g", badge: "New" },
  { id: "3", name: "Pav Bhaji Masala", image: product3, price: 125, originalPrice: 155, weight: "50g" },
  { id: "4", name: "Sambhar Masala", image: product4, price: 130, originalPrice: 160, weight: "100g" },
];

const newlyLaunched = [
  { id: "5", name: "Tea Masala", image: product5, price: 95, originalPrice: 120, weight: "50g", badge: "New" },
  { id: "6", name: "Chat Masala", image: product1, price: 85, originalPrice: 110, weight: "50g", badge: "New" },
  { id: "7", name: "Tandoori Masala", image: product2, price: 140, originalPrice: 175, weight: "100g", badge: "New" },
  { id: "8", name: "Biryani Masala", image: product3, price: 150, originalPrice: 190, weight: "100g", badge: "New" },
];

const combos = [
  { id: "9", name: "Combo Pack - Kitchen Essentials", image: product4, price: 399, originalPrice: 550, weight: "5 items", badge: "Combo" },
  { id: "10", name: "Combo Pack - Premium Masalas", image: product5, price: 599, originalPrice: 800, weight: "8 items", badge: "Combo" },
];

const specials = [
  { id: "20", name: "Premium Garam Masala", image: product2, price: 160, originalPrice: 200, weight: "100g", badge: "Our Special" },
  { id: "21", name: "Exotic Biryani Mix", image: product4, price: 210, originalPrice: 250, weight: "200g", badge: "Limited" },
];

const recentlyBought = [
  { id: "30", name: "Chole Masala", image: product1, price: 99, originalPrice: 125, weight: "100g", badge: "Popular" },
  { id: "31", name: "Paneer Tikka Masala", image: product3, price: 145, originalPrice: 170, weight: "100g", badge: "Trending" },
  { id: "32", name: "Paneer Tikka Masala", image: product2, price: 145, originalPrice: 170, weight: "100g", badge: "Trending" },
];

const features = [
  { icon: <Truck className="h-8 w-8" />, title: "Free Shipping", description: "On orders above ₹299" },
  { icon: <Shield className="h-8 w-8" />, title: "100% Authentic", description: "Pure & natural ingredients" },
  { icon: <Clock className="h-8 w-8" />, title: "Quick Delivery", description: "Fast doorstep delivery" },
  { icon: <Award className="h-8 w-8" />, title: "Quality Assured", description: "Premium quality products" },
];

const categories = [
  "Whole Spices",
  "Powdered Spices",
  "Blended Masalas",
  "Tea Masala",
  "Papad Masala",
  "Chaat Masala",
  "Garam Masala",
  "Kitchen King"
];

const testimonials = [
  { name: "Priya Sharma", review: "The quality of spices is exceptional! My dishes taste so much better now.", rating: 5 },
  { name: "Rajesh Kumar", review: "Authentic flavors and great packaging. Highly recommended!", rating: 5 },
  { name: "Anita Patel", review: "Best masalas I've ever used. Will definitely order again!", rating: 5 }
];

const Index = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <HeroSection />

      {/* Newly Launched */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="mb-4">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">Newly Launched</h2>
            <p className="text-xs sm:text-base text-muted-foreground">Fresh arrivals for your kitchen</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
            {newlyLaunched.map(product => <ProductCard key={product.id} {...product} />)}
          </div>
        </div>
      </section>

      {/* Our Specials */}
      <section className="py-10 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-7">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Our Specials</h2>
            <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Discover what makes us unique with our curated specialty masalas and blends!
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-6">
            {specials.map(product => <ProductCard key={product.id} {...product} />)}
          </div>
        </div>
      </section>

      <VideoStorySection />

      {/* Best Selling Products */}
      <section className="py-12">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">
                Best Selling Products
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground">Discover our most loved spices and masalas</p>
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto hidden sm:flex"
              asChild
            >
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
            {featuredProducts.map(product => <ProductCard key={product.id} {...product} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Bought */}
      <section className="py-10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="mb-4">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">Recently Bought</h2>
            <p className="text-xs sm:text-base text-muted-foreground">Hot off the shelf — just bought by other foodies!</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
            {recentlyBought.map(product => <ProductCard key={product.id} {...product} />)}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Shop by Category</h2>
            <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of authentic Indian spices and masalas
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to="/products"
                className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-card border border-border p-3 sm:p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="relative font-semibold text-xs sm:text-base text-foreground group-hover:text-primary transition-colors">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Combo Offers */}
      <section className="py-10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-5">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Special Combo Offers
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Save more with our specially curated combo packs
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-8 max-w-4xl mx-auto">
            {combos.map(product => <ProductCard key={product.id} {...product} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">What Our Customers Say</h2>
            <p className="text-xs sm:text-base text-muted-foreground">Real reviews from real customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-accent">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.review}</p>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Spice Up Your Kitchen?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Order now and experience the authentic taste of India
          </p>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
            <Link to="/products" className="flex items-center justify-center">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Index;
