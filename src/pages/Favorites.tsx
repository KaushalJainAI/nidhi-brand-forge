import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/context/FavoritesContext";

const Favorites = () => {
  const { favorites } = useFavorites();


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-8">
          My Wishlist
        </h1>
        
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-16">
            <p className="text-muted-foreground text-base sm:text-lg">Your wishlist is empty</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Favorites;
