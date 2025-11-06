import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext"; // <-- import the context


interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
}


const ProductCard = ({ name, image, price, originalPrice, badge }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();


  const cartItem = cart.find(item => item.name === name);
  const quantity = cartItem?.quantity || 0;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;


  const handleAddToCart = () => {
    addToCart({ name, image, price, originalPrice, badge });
  };


  const incrementQty = () => {
    updateQuantity(name, quantity + 1);
  };


  const decrementQty = () => {
    if (quantity > 1) {
      updateQuantity(name, quantity - 1);
    } else {
      removeFromCart(name);
    }
  };


  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-border">
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          {badge}
        </div>
      )}
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          {discount}% OFF
        </div>
      )}
      {/* Favorite Button */}
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Heart
          className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      </button>
      {/* Image */}
      <div className="relative overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      {/* Content */}
      <div className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">{name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">₹{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
          )}
        </div>


        {/* Quantity Controls - Show if item is in cart */}
        {cartItem ? (
          <div className="flex items-center justify-center gap-2 w-full mb-4">
            <Button size="sm" className="flex-1" onClick={decrementQty}>-</Button>
            <span className="font-bold flex-1 py-2 text-center">{quantity}</span>
            <Button size="sm" className="flex-1" onClick={incrementQty}>+</Button>
          </div>
        ) : (
          <Button className="w-full group/btn" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
            Add to Cart
          </Button>
        )}

      </div>
    </Card>
  );
};


export default ProductCard;
