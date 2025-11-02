import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, Users, Heart, Leaf } from "lucide-react";
import spicesImage from "@/assets/spices-hero.jpg";

const About = () => {
  const values = [
    {
      icon: <Award className="h-12 w-12" />,
      title: "Quality First",
      description: "We never compromise on the quality of our products"
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Customer Focused",
      description: "Your satisfaction is our top priority"
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: "Made with Love",
      description: "Each product is crafted with care and passion"
    },
    {
      icon: <Leaf className="h-12 w-12" />,
      title: "100% Natural",
      description: "Pure ingredients with no artificial additives"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About Nidhi Graph Udhyog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bringing authentic Indian flavors to your kitchen since years
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Nidhi Graph Udhyog was founded with a simple mission: to bring the authentic taste of traditional Indian spices to every household. Our journey began with a passion for preserving the rich culinary heritage of India.
                </p>
                <p>
                  Over the years, we have grown from a small family business to a trusted name in the spice industry. Our commitment to quality, authenticity, and customer satisfaction has remained unwavering.
                </p>
                <p>
                  Today, we take pride in offering a wide range of premium spices and masalas, each carefully selected and processed to retain their natural aroma and flavor. We source our ingredients directly from farmers, ensuring the highest quality from farm to kitchen.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform -rotate-6"></div>
              <img 
                src={spicesImage} 
                alt="Our Story"
                className="relative rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow">
                <div className="text-primary mb-4 flex justify-center">{value.icon}</div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Premium Products</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Pure & Natural</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
