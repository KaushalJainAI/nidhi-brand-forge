import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const Products = () => {
  const products = [
    { name: "Garadu Masala", image: product1, price: 120, originalPrice: 150, badge: "Best Seller" },
    { name: "Kitchen King Masala", image: product2, price: 135, originalPrice: 170, badge: "New" },
    { name: "Pav Bhaji Masala", image: product3, price: 125, originalPrice: 155 },
    { name: "Sambhar Masala", image: product4, price: 130, originalPrice: 160 },
    { name: "Tea Masala", image: product5, price: 95, originalPrice: 120, badge: "Popular" },
    { name: "Chana Masala", image: product1, price: 115, originalPrice: 145 },
    { name: "Garam Masala", image: product2, price: 140, originalPrice: 175 },
    { name: "Biryani Masala", image: product3, price: 150, originalPrice: 185 },
    { name: "Chaat Masala", image: product4, price: 90, originalPrice: 115 },
    { name: "Paneer Masala", image: product5, price: 128, originalPrice: 160 },
    { name: "Chole Masala", image: product1, price: 118, originalPrice: 148 },
    { name: "Rajma Masala", image: product2, price: 122, originalPrice: 152 },
  ];

  const categories = ["All Products", "Blended Masalas", "Whole Spices", "Powdered Spices", "Tea Masala"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Premium Products
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete range of authentic Indian spices and masalas
          </p>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <Select defaultValue="featured">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
