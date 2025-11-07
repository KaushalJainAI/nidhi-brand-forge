import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Download, Repeat, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";

const MyOrders = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  // Mock orders data
  const orders = [
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 450,
      items: [
        { name: "Garadu Masala", image: product1, quantity: 2, price: 120 },
        { name: "Kitchen King Masala", image: product2, quantity: 1, price: 135 },
      ],
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-20",
      status: "In Transit",
      total: 260,
      items: [
        { name: "Pav Bhaji Masala", image: product1, quantity: 2, price: 125 },
      ],
    },
  ];

  const handleTrackOrder = (orderId: string) => {
    navigate(`/track-order?id=${orderId}`);
  };

  const handleReorder = (order: any) => {
    toast.success("Items added to cart");
    // In production, add items to cart
  };

  const handleDownloadBill = (orderId: string) => {
    toast.success(`Downloading bill for ${orderId}`);
    // In production, download invoice
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    toast.success("Thank you for your feedback!");
    setRating(0);
    setReview("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            My Orders
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            View and manage your orders
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Order {order.id}</h3>
                        <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                      </div>
                      <Badge
                        variant={order.status === "Delivered" ? "default" : "secondary"}
                        className="w-fit"
                      >
                        {order.status}
                      </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="flex justify-between items-center mb-6 pb-6 border-b">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">₹{order.total}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrackOrder(order.id)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Track Order
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(order)}
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Reorder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadBill(order.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Bill
                      </Button>
                      {order.status === "Delivered" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4 mr-2" />
                              Rate Product
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rate Your Purchase</DialogTitle>
                              <DialogDescription>
                                Help us improve by sharing your experience
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Rating
                                </label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setRating(star)}
                                      className="focus:outline-none"
                                    >
                                      <Star
                                        className={`h-8 w-8 ${
                                          star <= rating
                                            ? "fill-primary text-primary"
                                            : "text-muted-foreground"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Review (Optional)
                                </label>
                                <Textarea
                                  placeholder="Share your experience..."
                                  value={review}
                                  onChange={(e) => setReview(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <Button onClick={handleSubmitReview} className="w-full">
                                Submit Review
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-4">No orders yet</p>
                <Link to="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MyOrders;
