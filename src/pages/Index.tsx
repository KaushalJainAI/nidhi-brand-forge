import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const Index = () => {
  const featuredProducts = [
    {
      name: "Garadu Masala",
      image: product1,
      price: 120,
      originalPrice: 150,
      badge: "Best Seller"
    },
    {
      name: "Kitchen King Masala",
      image: product2,
      price: 135,
      originalPrice: 170,
      badge: "New"
    },
    {
      name: "Pav Bhaji Masala",
      image: product3,
      price: 125,
      originalPrice: 155,
    },
    {
      name: "Sambhar Masala",
      image: product4,
      price: 130,
      originalPrice: 160,
    },
    {
      name: "Tea Masala",
      image: product5,
      price: 95,
      originalPrice: 120,
      badge: "Popular"
    },
  ];

  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Free Shipping",
      description: "On orders above ₹299"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "100% Authentic",
      description: "Pure & natural ingredients"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Quick Delivery",
      description: "Fast doorstep delivery"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Quality Assured",
      description: "Premium quality products"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Everyone's Favorite
              </h2>
              <p className="text-muted-foreground">Discover our most loved spices and masalas</p>
            </div>
            <Button variant="outline" className="group">
              <Link to="/products" className="flex items-center">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of authentic Indian spices and masalas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {["Whole Spices", "Powdered Spices", "Blended Masalas", "Tea Masala", "Papad Masala", "Chaat Masala", "Garam Masala", "Kitchen King"].map((category, index) => (
              <Link
                key={index}
                to="/products"
                className="group relative overflow-hidden rounded-xl bg-card border border-border p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="relative font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground">Real reviews from real customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                review: "The quality of spices is exceptional! My dishes taste so much better now.",
                rating: 5
              },
              {
                name: "Rajesh Kumar",
                review: "Authentic flavors and great packaging. Highly recommended!",
                rating: 5
              },
              {
                name: "Anita Patel",
                review: "Best masalas I've ever used. Will definitely order again!",
                rating: 5
              }
            ].map((testimonial, index) => (
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
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Spice Up Your Kitchen?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Order now and experience the authentic taste of India
          </p>
          <Button size="lg" variant="secondary" className="group">
            <Link to="/products" className="flex items-center">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
