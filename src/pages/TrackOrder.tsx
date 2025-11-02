import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import { useState } from "react";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Track order logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Track Your Order
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter your order ID to check the status of your delivery
          </p>
        </div>
      </section>

      {/* Track Order Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <Package className="h-12 w-12 text-primary" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-foreground mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your order ID"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You can find your order ID in the confirmation email
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Track Order
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you're having trouble tracking your order, please contact our customer support team.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>

          {/* Order Status Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-semibold text-foreground mb-2">Order Placed</h3>
              <p className="text-sm text-muted-foreground">Your order has been confirmed</p>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="text-3xl mb-2">🚚</div>
              <h3 className="font-semibold text-foreground mb-2">In Transit</h3>
              <p className="text-sm text-muted-foreground">Your order is on its way</p>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold text-foreground mb-2">Delivered</h3>
              <p className="text-sm text-muted-foreground">Your order has arrived</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackOrder;
