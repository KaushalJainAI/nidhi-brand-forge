import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchAPI } from "@/lib/api/search";

interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  category: string;
  spice_form: string;
  price: number;
  original_price: number;
  discount: number;
  weight: string;
  image: string;
  score: number;
  score_type: string;
  in_stock: number;
  is_featured: boolean;
}

interface SearchResponse {
  query: string;
  total_results: number;
  products: SearchProduct[];
  combos: any[];
  stats: {
    direct_matches: number;
    other_recs: number;
  };
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("relevance");
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery);
    } else {
      setSearchData(null);
    }
  }, [searchQuery]);

  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    try {
      const response = await searchAPI.search(query);
      // Type assertion to match interface
      setSearchData(response as SearchResponse);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchData(null);
    } finally {
      setLoading(false);
    }
  };

  // Use backend ranking with frontend sorting overlay
  const getSortedProducts = () => {
    if (!searchData?.products) return [];
    
    return [...searchData.products].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "featured":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case "relevance":
        default:
          // Use backend score as primary sort (maintains backend ranking)
          return b.score - a.score;
      }
    });
  };

  const sortedProducts = getSortedProducts();
  const totalResults = searchData?.total_results || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Searching for products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Search Results Header */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-10 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">
            Search Results
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
            {searchData?.stats && (
              <span className="block text-sm mt-1">
                ({searchData.stats.direct_matches} direct, {searchData.stats.other_recs} recommended)
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Results & Products */}
      <section className="py-6 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Sort */}
          {sortedProducts.length > 0 && (
            <div className="flex justify-end items-center mb-4 sm:mb-8">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard 
                  key={product.id}
                  id={product.id.toString()}
                  name={product.name}
                  image={product.image.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${product.image}` : product.image}
                  price={product.price}
                  originalPrice={product.original_price}
                  weight={product.weight}
                  badge={product.is_featured ? "Featured" : product.discount > 0 ? `${product.discount}% OFF` : undefined}
                />
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
