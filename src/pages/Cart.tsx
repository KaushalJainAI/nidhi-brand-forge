import { useEffect, useRef } from "react";
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
  const prevCart = useRef(cart);

  // Sync cart when entering and leaving cart page
  useEffect(() => {
    if (!isLoggedIn) {
      window.alert("You need to log in to add items to your cart.");
      navigate('/login', { state: { from: '/cart' } });
    } else if (cart.length > 0) {
      cartAPI.sync(cart)
        .then((data) => {
          setCart(data.items || []);
          if (data.skipped && data.skipped.length > 0) {
            toast.error("Some products could not be synced (out of stock or removed).");
          }
        })
        .catch(() => {
          toast.error("Failed to sync cart with server.");
        });
    }
    prevCart.current = cart;
    return () => {
      if (isLoggedIn && prevCart.current.length > 0) {
        cartAPI.sync(prevCart.current).catch(() => {});
      }
    };
  }, [isLoggedIn, navigate]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success("Item removed from cart");
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const handleCheckout = async () => {
    try {
      const data = await cartAPI.sync(cart);
      setCart(data.items || []);
      if (data.skipped && data.skipped.length > 0) {
        toast.error("Some items could not be synced (out of stock or removed)");
      }
      navigate('/billing');
    } catch {
      toast.error("Could not sync cart with server!");
    }
  };

  const recommendedProducts = [
    { id: "2", name: "Kitchen King Masala", image: product2, price: 135, originalPrice: 170, weight: "100g" },
    { id: "3", name: "Pav Bhaji Masala", image: product3, price: 125, originalPrice: 155, weight: "100g" },
    { id: "4", name: "Sambhar Masala", image: product4, price: 130, originalPrice: 160, weight: "100g" },
    { id: "6", name: "Chana Masala", image: product1, price: 115, originalPrice: 145, weight: "100g" },
  ];

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
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 bg-muted rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">Weight: {(item as any).weight || "100g"}</p>
                      <p className="text-primary font-bold">₹{item.price}</p>
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
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={handleClearCart} className="w-full">
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
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
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
