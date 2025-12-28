import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/spices-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10"></div>
      
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
          {/* Text Content */}
          <div className="relative z-10 space-y-4 sm:space-y-6 animate-fade-in-up">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-full text-primary font-semibold text-xs sm:text-sm transition-all duration-300 hover:bg-primary/20">
              Authentic Indian Spices
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Taste of <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Tradition</span> in Every Spice
            </h1>
            
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl">
              Experience the authentic flavors of India with our premium quality spices and masalas. Made with love, delivered with care.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group transition-all duration-300 hover:shadow-lg active:scale-95" asChild>
                <Link to="/products" className="flex items-center">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="transition-all duration-300 hover:bg-primary/5 active:scale-95" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-8">
              <div className="transition-all duration-300 hover:scale-105">
                <div className="text-xl sm:text-3xl font-bold text-primary">50+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Products</div>
              </div>
              <div className="transition-all duration-300 hover:scale-105">
                <div className="text-xl sm:text-3xl font-bold text-primary">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Pure & Natural</div>
              </div>
              <div className="transition-all duration-300 hover:scale-105">
                <div className="text-xl sm:text-3xl font-bold text-primary">1.1M+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden sm:block animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl sm:rounded-3xl transform rotate-6 transition-transform duration-500 group-hover:rotate-3"></div>
            <img 
              src={heroImage} 
              alt="Premium Indian Spices"
              className="relative rounded-2xl sm:rounded-3xl shadow-2xl w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
