import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { useCart } from "@/context/CartContext";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleRemoveItem = (name: string) => {
    removeFromCart(name);
    toast.success("Item removed from cart");
  };

  const handleClearCart = () => {
    cart.forEach(item => removeFromCart(item.name));
    toast.success("Cart cleared");
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
              <Link to="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.name}>
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
                        onClick={() => updateQuantity(item.name, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.name, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.name)}
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
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/billing" className="w-full">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* People Also Buy Carousel */}
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
