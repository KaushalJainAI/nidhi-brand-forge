import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


interface ProductCardProps {
  id?: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  weight?: string;
  itemType?: "product" | "combo";  // Add this
}


const ProductCard = ({ 
  id = "1", 
  name, 
  image, 
  price, 
  originalPrice, 
  badge, 
  weight = "100g",
  itemType = "product"  // Default to product
}: ProductCardProps) => {
  const { isLoggedIn } = useAuth();
  const { cart, addToCart, updateQuantity } = useCart();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  // Find item by BOTH id AND itemType
  const itemInCart = cart.find(item => item.id === id && item.itemType === itemType);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      window.alert("You need to log in to add items to your cart.");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    addToCart({
      id,
      itemType,  // Include itemType
      name,
      image,
      price,
      originalPrice,
      badge,
    });
    // toast.success("Added to cart");
  };

  const handleToggleFavorite = () => {
    toggleFavorite({ id, name, image, price, originalPrice, badge, weight });
    toast.success(checkIsFavorite(id) ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
      <Link to={`/products/${id}`} className="flex-grow flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative">
            <img
              src={image}
              alt={name}
              className="w-full h-32 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {badge && (
              <Badge className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-accent text-accent-foreground text-[10px] sm:text-xs px-1 sm:px-2">
                {badge}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-1 sm:top-2 right-1 sm:right-2 h-7 w-7 sm:h-9 sm:w-9 bg-background/80 backdrop-blur-sm hover:bg-background ${
                checkIsFavorite(id) ? "text-red-500" : "text-muted-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleToggleFavorite();
              }}
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${checkIsFavorite(id) ? "fill-current" : ""}`} />
            </Button>
          </div>
          <div className="p-2 sm:p-4 flex-grow flex flex-col">
            <h3 className="font-semibold text-foreground mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-base flex-grow">
              {name}
            </h3>
            <div className="mt-auto">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <span className="text-sm sm:text-lg font-bold text-primary">₹{price}</span>
                {originalPrice && (
                  <span className="text-xs sm:text-sm text-muted-foreground line-through">
                    ₹{originalPrice}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">{weight}</p>
            </div>
          </div>
        </CardContent>
      </Link>
      <div className="px-2 sm:px-4 pb-2 sm:pb-4 mt-auto">
        {itemInCart ? (
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(id, itemInCart.quantity - 1, itemType)}
              className="h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="font-medium text-foreground min-w-[1.5rem] sm:min-w-[2rem] text-center text-xs sm:text-base">
              {itemInCart.quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(id, itemInCart.quantity + 1, itemType)}
              className="h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            className="w-full h-7 sm:h-9 text-xs sm:text-sm"
            size="sm"
          >
            Add to Cart
          </Button>
        )}
      </div>
    </Card>
  );
};


export default ProductCard;
