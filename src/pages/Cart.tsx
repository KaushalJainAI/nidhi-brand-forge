import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, AlertCircle } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cartAPI, searchAPI } from "@/lib/api";

// Helper to resolve image URLs from backend (may be relative paths)
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return product1;
  // If it's already an absolute URL or data URL, return as-is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  // If it's a relative path starting with /, prepend the base URL
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
};


const Cart = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { cart, setCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

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
        // console.log('Fetching cart from backend...');
        
        const response = await cartAPI.get();
        
        // console.log('Backend cart response:', response);
        
        if (response.success && response.items && Array.isArray(response.items)) {
          const backendCart = response.items.map((item: any) => ({
            id: Number(item.product_id || item.id),
            itemType: (item.item_type || "product") as "product" | "combo",
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            badge: item.badge,
          }));
          
          setCart(backendCart);
          // console.log('Cart loaded from backend:', backendCart);
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

  // Filter in-stock items for checkout
  const inStockItems = cart.filter(item => item.inStock !== false);
  const outOfStockItems = cart.filter(item => item.inStock === false);
  
  const subtotal = inStockItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleRemoveItem = async (id: number, itemType: "product" | "combo") => {
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
    if (inStockItems.length === 0) {
      toast.error("No in-stock items to checkout");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the latest cart state from backend before checkout
      // console.log('Fetching latest cart before checkout...');
      
      const response = await cartAPI.get();
      
      // console.log('Checkout cart response:', response);
      
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
        id: Number(item.product_id || item.id),
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

  // Fetch recommendations from backend
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await searchAPI.getRecommendations(8);
        
        // Format products for ProductCard - use correct field names from search API
        const formattedProducts = (response.products || []).map((p: any) => ({
          id: Number(p.id),
          name: p.name,
          image: getImageUrl(p.image),
          price: p.price,
          originalPrice: p.original_price > p.price ? p.original_price : undefined,
          weight: p.weight || "100g",
          itemType: "product" as const,
          badge: p.is_featured ? "Featured" : undefined,
        }));
        
        // Format combos for ProductCard
        const formattedCombos = (response.combos || []).map((c: any) => ({
          id: Number(c.id),
          name: c.name || c.display_title,
          image: getImageUrl(c.image),
          price: c.price || c.final_price,
          originalPrice: c.original_price > c.price ? c.original_price : undefined,
          weight: "Combo",
          itemType: "combo" as const,
          badge: c.badge || "Combo",
        }));
        
        // Combine and limit to 8 items
        setRecommendations([...formattedProducts, ...formattedCombos].slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        // Keep empty array on error (don't show recommendations section)
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading && cart.length === 0) {
    return (
      <>
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
      <div className="container py-8 pb-24 md:pb-8">
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
                <Card key={`${item.itemType}-${item.id}`} className={item.inStock === false ? "opacity-60 border-destructive/30" : ""}>
                  <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-6">
                    <Link 
                      to={item.itemType === 'combo' ? `/combos/${item.id}` : `/products/${item.id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-24 sm:h-24 bg-muted rounded-md object-cover hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={item.itemType === 'combo' ? `/combos/${item.id}` : `/products/${item.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-semibold text-sm sm:text-lg truncate">{item.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        <span>{item.itemType === "combo" ? "Combo" : "Product"}</span>
                        <span>•</span>
                        {item.inStock === false ? (
                          <span className="text-destructive font-medium">Out of Stock</span>
                        ) : (
                          <span className="text-green-600 font-medium">In Stock</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary font-bold text-sm sm:text-base">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1 py-0.5 rounded hidden sm:inline-block">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-10 sm:w-10"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.itemType)}
                        disabled={isLoading || item.inStock === false}
                      >
                        -
                      </Button>
                      <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-10 sm:w-10"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.itemType)}
                        disabled={isLoading || item.inStock === false}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-10 sm:w-10 flex-shrink-0"
                      onClick={() => handleRemoveItem(item.id, item.itemType)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
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
                <CardHeader className="py-3 sm:py-4">
                  <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 py-2 sm:py-4">
                  {outOfStockItems.length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-destructive font-medium flex items-center gap-1 sm:gap-2">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        {outOfStockItems.length} out of stock
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({inStockItems.length})</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="py-3 sm:py-4">
                  <Button 
                    className="w-full h-9 sm:h-10 text-sm" 
                    onClick={handleCheckout}
                    disabled={isLoading || inStockItems.length === 0}
                  >
                    {isLoading ? "Processing..." : inStockItems.length === 0 ? "No Items" : "Checkout"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
        {cart.length > 0 && recommendations.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">People Also Buy</h2>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-2 sm:-ml-4">
                {recommendations.map((product) => (
                  <CarouselItem key={`${product.itemType}-${product.id}`} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <ProductCard {...product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </section>
        )}
      </div>
    </>
  );
};

export default Cart;
