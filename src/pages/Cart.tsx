import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cartAPI } from "@/lib/api";


const Cart = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { cart, setCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from backend on mount - only once
  useEffect(() => {
    if (!isLoggedIn) {
      window.alert("You need to log in to view your cart.");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    const fetchCart = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching cart from backend...');
        
        const response = await cartAPI.get();
        
        console.log('Backend cart response:', response);
        
        if (response.success && response.items && Array.isArray(response.items)) {
          const backendCart = response.items.map((item: any) => ({
            id: String(item.id),
            itemType: (item.item_type || "product") as "product" | "combo",
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            badge: item.badge,
          }));
          
          setCart(backendCart);
          console.log('Cart loaded from backend:', backendCart);
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        toast.error("Failed to load cart from server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [isLoggedIn]); // Only depend on isLoggedIn

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleRemoveItem = async (id: string, itemType: "product" | "combo") => {
    try {
      await removeFromCart(id, itemType);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the latest cart state from backend before checkout
      console.log('Fetching latest cart before checkout...');
      
      const response = await cartAPI.get();
      
      console.log('Checkout cart response:', response);
      
      if (!response.success) {
        toast.error("Failed to verify cart");
        return;
      }
      
      if (!response.items || response.items.length === 0) {
        toast.error("Your cart is empty");
        setCart([]);
        return;
      }

      // Update cart with latest backend data
      const backendCart = response.items.map((item: any) => ({
        id: String(item.id),
        itemType: (item.item_type || "product") as "product" | "combo",
        name: item.name,
        image: item.image,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        badge: item.badge,
      }));
      
      setCart(backendCart);
      
      // Navigate to billing page
      navigate('/billing');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Could not verify cart with server!");
    } finally {
      setIsLoading(false);
    }
  };

  const recommendedProducts = [
    { id: "2", name: "Kitchen King Masala", image: product2, price: 135, originalPrice: 170, weight: "100g", itemType: "product" as const },
    { id: "3", name: "Pav Bhaji Masala", image: product3, price: 125, originalPrice: 155, weight: "100g", itemType: "product" as const },
    { id: "4", name: "Sambhar Masala", image: product4, price: 130, originalPrice: 160, weight: "100g", itemType: "product" as const },
    { id: "6", name: "Chana Masala", image: product1, price: 115, originalPrice: 145, weight: "100g", itemType: "product" as const },
  ];

  if (isLoading && cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
        {cart.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild>
                <a href="/products">Continue Shopping</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={`${item.itemType}-${item.id}`}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 bg-muted rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        Type: {item.itemType === "combo" ? "Combo Offer" : "Product"}
                      </p>
                      {item.badge && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.badge}
                        </span>
                      )}
                      <p className="text-primary font-bold mt-1">₹{item.price}</p>
                      {item.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          ₹{item.originalPrice}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.itemType)}
                        disabled={isLoading}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.itemType)}
                        disabled={isLoading}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id, item.itemType)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button 
                variant="outline" 
                onClick={handleClearCart} 
                className="w-full"
                disabled={isLoading}
              >
                Clear Cart
              </Button>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
        {cart.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8">People Also Buy</h2>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {recommendedProducts.map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                    <ProductCard {...product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}
      </div>
    </>
  );
};

export default Cart;
