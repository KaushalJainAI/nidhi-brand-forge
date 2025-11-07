import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to products page after 5 seconds
    const timer = setTimeout(() => {
      navigate("/products");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
