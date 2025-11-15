import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE_URL = "http://localhost:8000"; // Or 8000 if that's your Django port

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All Products"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/api/categories/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((categoryList) => {
        const names = categoryList.results.map(category => category.name); // note the .results
        setCategories(["All Products", ...names]);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/products/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => setProducts(data.results)) // note the .results
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtering by category name (case-insensitive)
  const filteredProducts =
    selectedCategory === "All Products"
      ? products
      : products.filter(
          (p) =>
            (p.category_name || "").toLowerCase() === selectedCategory.toLowerCase()
        );

  // Sorting logic, using final_price for pricing
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.final_price - b.final_price;
      case "price-high":
        return b.final_price - a.final_price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        // Featured; you could change this to honor 'is_featured' if desired
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>Error: {error}</div>
            ) : sortedProducts.length === 0 ? (
              <div>No products found.</div>
            ) : (
              sortedProducts.map((product, index) => (
                <ProductCard key={product.id || index} {...product} />
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Products;
