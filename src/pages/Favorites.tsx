import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";

const Favorites = () => {
  const [favorites] = useState([
    {
      id: 1,
      name: "Garadu Masala",
      image: product1,
      price: 120,
      originalPrice: 150,
      weight: "100g",
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Kitchen King Masala",
      image: product2,
      price: 135,
      originalPrice: 170,
      weight: "100g",
      badge: "New"
    },
    {
      id: 3,
      name: "Pav Bhaji Masala",
      image: product3,
      price: 125,
      originalPrice: 155,
      weight: "50g"
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          My Wishlist
        </h1>
        
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Your wishlist is empty</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Favorites;
