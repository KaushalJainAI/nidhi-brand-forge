import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { fetchCartFromBackend, setCart } = useCart();

  useEffect(() => {
    // Clear cart and sync with backend on mount
    const clearAndSyncCart = async () => {
      try {
        console.log('Order successful - syncing cart with backend...');
        
        // Clear local cart state immediately
        setCart([]);
        localStorage.removeItem('shopping_cart');
        
        // Fetch latest cart from backend (should be empty after order)
        await fetchCartFromBackend();
        
        console.log('Cart cleared and synced successfully');
      } catch (error) {
        console.error('Failed to sync cart after order:', error);
        // Don't show error toast - order was successful
      }
    };

    clearAndSyncCart();

    // Redirect to products page after 5 seconds
    const timer = setTimeout(() => {
      navigate("/products");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, fetchCartFromBackend, setCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-20 md:pb-0">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center animate-bounce">
          <CheckCircle className="h-24 w-24 text-green-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4 animate-fade-in">
          Order Successfully Placed!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 animate-fade-in">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>
        
        <div className="space-y-4 animate-fade-in">
          <Button 
            onClick={() => navigate("/products")} 
            size="lg"
            className="w-full"
          >
            Continue Shopping
          </Button>
          
          <Button 
            onClick={() => navigate("/my-orders")} 
            variant="outline"
            size="lg"
            className="w-full"
          >
            View My Orders
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-8">
          Redirecting to products page in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
