import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [sortBy, setSortBy] = useState("featured");

  const allProducts = [
    { id: "1", name: "Garadu Masala", image: product1, price: 120, originalPrice: 150, badge: "Best Seller", weight: "100g" },
    { id: "2", name: "Kitchen King Masala", image: product2, price: 135, originalPrice: 170, badge: "New", weight: "100g" },
    { id: "3", name: "Pav Bhaji Masala", image: product3, price: 125, originalPrice: 155, weight: "100g" },
    { id: "4", name: "Sambhar Masala", image: product4, price: 130, originalPrice: 160, weight: "100g" },
    { id: "5", name: "Tea Masala", image: product5, price: 95, originalPrice: 120, badge: "Popular", weight: "50g" },
    { id: "6", name: "Chana Masala", image: product1, price: 115, originalPrice: 145, weight: "100g" },
    { id: "7", name: "Garam Masala", image: product2, price: 140, originalPrice: 175, weight: "100g" },
    { id: "8", name: "Biryani Masala", image: product3, price: 150, originalPrice: 185, weight: "100g" },
    { id: "9", name: "Chaat Masala", image: product4, price: 90, originalPrice: 115, weight: "50g" },
    { id: "10", name: "Paneer Masala", image: product5, price: 128, originalPrice: 160, weight: "100g" },
    { id: "11", name: "Chole Masala", image: product1, price: 118, originalPrice: 148, weight: "100g" },
    { id: "12", name: "Rajma Masala", image: product2, price: 122, originalPrice: 152, weight: "100g" },
  ];

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search Results Header */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Search Results
          </h1>
          <p className="text-lg text-muted-foreground">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        </div>
      </section>

      {/* Results & Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Sort */}
          <div className="flex justify-end items-center mb-8">
            <Select value={sortBy} onValueChange={setSortBy}>
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
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">No products found matching your search</p>
              <p className="text-muted-foreground">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SearchResults;
