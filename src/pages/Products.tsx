import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { productsAPI, categoriesAPI } from "@/lib/api";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || "all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    categoriesAPI.getAll()
      .then((data) => {
        const categoryList = data.results || data || [];
        setCategories(categoryList);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    setLoading(true);
    setError("");
    
    const fetchProducts = async () => {
      try {
        let data;
        if (selectedCategory && selectedCategory !== "all") {
          data = await productsAPI.getByCategory(selectedCategory);
        } else {
          data = await productsAPI.getAll();
        }
        setProducts(data.results || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Sync category with URL
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
  };

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.final_price || a.discount_price || a.price;
    const priceB = b.final_price || b.discount_price || b.price;
    
    switch (sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const formatProduct = (product: any) => ({
    id: Number(product.id),
    name: product.name,
    image: product.image,
    price: product.final_price || product.discount_price || product.price,
    originalPrice: product.discount_price ? product.price : undefined,
    weight: product.weight || "100g",
    badge: product.badge,
    itemType: "product" as const,
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-10 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">
            Our Premium Products
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete range of authentic Indian spices and masalas
          </p>
        </div>
      </section>
      <section className="py-6 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 whitespace-nowrap"
                onClick={() => handleCategoryChange("all")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === String(category.id) ? "default" : "outline"}
                  size="sm"
                  className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 whitespace-nowrap"
                  onClick={() => handleCategoryChange(String(category.id))}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 h-9 text-xs sm:text-sm">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-destructive">{error}</div>
            ) : sortedProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">No products found.</div>
            ) : (
              sortedProducts.map((product) => (
                <ProductCard key={product.id} {...formatProduct(product)} />
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
