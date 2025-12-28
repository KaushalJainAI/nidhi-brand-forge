import Footer from "@/components/Footer";
import { Award, Users, Heart, Leaf } from "lucide-react";
import spicesImage from "@/assets/spices-hero.jpg";

const About = () => {
  const values = [
    {
      icon: <Award className="h-8 w-8 sm:h-12 sm:w-12" />,
      title: "Quality First",
      description: "We never compromise on the quality of our products"
    },
    {
      icon: <Users className="h-8 w-8 sm:h-12 sm:w-12" />,
      title: "Customer Focused",
      description: "Your satisfaction is our top priority"
    },
    {
      icon: <Heart className="h-8 w-8 sm:h-12 sm:w-12" />,
      title: "Made with Love",
      description: "Each product is crafted with care and passion"
    },
    {
      icon: <Leaf className="h-8 w-8 sm:h-12 sm:w-12" />,
      title: "100% Natural",
      description: "Pure ingredients with no artificial additives"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-10 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">
            About Nidhi Grah Udyog
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Bringing authentic Indian flavors to your kitchen since years
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-6">
                Our Story
              </h2>
              <div className="space-y-3 sm:space-y-4 text-muted-foreground text-sm sm:text-base">
                <p>
                  Nidhi Grah Udyog was founded with a simple mission: to bring the authentic taste of traditional Indian spices to every household. Our journey began with a passion for preserving the rich culinary heritage of India.
                </p>
                <p>
                  Over the years, we have grown from a small family business to a trusted name in the spice industry. Our commitment to quality, authenticity, and customer satisfaction has remained unwavering.
                </p>
                <p className="hidden sm:block">
                  Today, we take pride in offering a wide range of premium spices and masalas, each carefully selected and processed to retain their natural aroma and flavor. We source our ingredients directly from farmers, ensuring the highest quality from farm to kitchen.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl sm:rounded-3xl transform -rotate-6"></div>
              <img 
                src={spicesImage} 
                alt="Our Story"
                className="relative rounded-2xl sm:rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-3 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-border hover:shadow-lg transition-shadow">
                <div className="text-primary mb-2 sm:mb-4 flex justify-center">{value.icon}</div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-lg">{value.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">50+</div>
              <div className="text-muted-foreground text-xs sm:text-base">Premium Products</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">1.1M+</div>
              <div className="text-muted-foreground text-xs sm:text-base">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">100%</div>
              <div className="text-muted-foreground text-xs sm:text-base">Pure & Natural</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">30+</div>
              <div className="text-muted-foreground text-xs sm:text-base">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
