// MyOrders.tsx

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Download,
  Repeat,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ordersAPI, Order } from "@/lib/api/orders";
import { useCart } from "@/context/CartContext";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({
    open: false,
    orderId: null,
  });

  const [currentRating, setCurrentRating] = useState(0);
  const [currentReview, setCurrentReview] = useState("");

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({
    open: false,
    orderId: null,
  });
  const [cancelLoading, setCancelLoading] = useState(false);

  const { addToCart } = useCart();

  const getProductImage = (productId: number) => {
    switch (productId) {
      case 1:
        return product1;
      case 2:
        return product2;
      case 3:
        return product3;
      case 4:
        return product4;
      default:
        return product1;
    }
  };

  const dummyOrders: Order[] = [
    {
      id: 1,
      order_number: "ORD-000001",
      status: "delivered",
      subtotal: 450,
      tax: 22.5,
      discount: 0,
      total: 472.5,
      shipping_address: "123 Main St, Chandigarh",
      created_at: "2025-12-20T10:30:00+05:30",
      updated_at: "2025-12-20T10:30:00+05:30",
      items: [
        {
          id: 1,
          product_id: 1,
          product_name: "Garadu Masala",
          quantity: 2,
          price: 120,
          total: 240,
        },
        {
          id: 2,
          product_id: 2,
          product_name: "Kitchen King Masala",
          quantity: 1,
          price: 135,
          total: 135,
        },
      ],
    },
  ];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: "Pending",
      in_transit: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return map[status.toLowerCase()] ?? status;
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(v);

  // reusable fetch function so we can call it after cancel as well
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(dummyOrders);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders. Showing sample data.");
      setOrders(dummyOrders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleReorder = async (order: Order) => {
    if (!order.items || order.items.length === 0) {
      toast.error("No items to reorder");
      return;
    }

    try {
      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          await addToCart({
            id: String(item.product_id),
            itemType: "product",
            name: item.product_name,
            image: getProductImage(item.product_id),
            price: item.price,
            originalPrice: item.price,
            badge: "Reorder",
          });
        }
      }

      toast.success("Items from this order added to cart");
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Failed to reorder items");
    }
  };

  const handleDownloadBill = (orderNumber: string) => {
    toast.success(`Downloading bill for ${orderNumber}`);
  };

  const handleSubmitReview = () => {
    if (currentRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    toast.success("Thank you for your feedback!");
    setReviewDialog({ open: false, orderId: null });
    setCurrentRating(0);
    setCurrentReview("");
  };

  const openCancelDialog = (orderId: number) => {
    setCancelDialog({ open: true, orderId });
  };

  const handleConfirmCancel = async () => {
    if (!cancelDialog.orderId) return;
    try {
      setCancelLoading(true);
      await ordersAPI.cancel(cancelDialog.orderId);
      toast.success("Order cancelled successfully");

      // auto-refresh list from backend
      await fetchOrders();

      setCancelDialog({ open: false, orderId: null });
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      const msg =
        err?.data?.error || "Failed to cancel order. Please try again.";
      toast.error(msg);
    } finally {
      setCancelLoading(false);
    }
  };

  const isCancellable = (status: string) => {
    const s = status.toLowerCase();
    return s === "pending" || s === "in_transit";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading orders...
            </p>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const cancellable = isCancellable(order.status);

                return (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Order {order.order_number}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                            className="w-fit"
                          >
                            {formatStatus(order.status)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleExpanded(order.id)}
                            aria-label={isExpanded ? "Show less" : "Show more"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Always-visible total row */}
                      <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(order.total)}
                        </span>
                      </div>

                      {/* SHOW MORE section with smooth transition */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "max-h-[800px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {isExpanded && (
                          <>
                            {/* Items */}
                            <div className="space-y-4 mb-6 mt-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-4"
                                >
                                  <img
                                    src={getProductImage(item.product_id)}
                                    alt={item.product_name}
                                    className="w-16 h-16 rounded-md object-cover"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {item.product_name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Quantity: {item.quantity} × ₹{item.price}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Item Total: {formatCurrency(item.total)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Summary */}
                            <div className="mb-4 pb-4 border-b space-y-1">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount</span>
                                  <span>
                                    -{formatCurrency(order.discount)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Tax</span>
                                <span>{formatCurrency(order.tax)}</span>
                              </div>
                            </div>

                            {/* Address */}
                            <p className="text-sm text-muted-foreground mb-4">
                              Shipping to: {order.shipping_address}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(order.id)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          {isExpanded ? "Show less" : "Show more"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(order)}
                          disabled={order.status.toLowerCase() === "cancelled"}
                        >
                          <Repeat className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBill(order.order_number)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Bill
                        </Button>

                        {cancellable && (
                          <Dialog
                            open={
                              cancelDialog.open &&
                              cancelDialog.orderId === order.id
                            }
                            onOpenChange={(open) => {
                              if (!open) {
                                setCancelDialog({ open: false, orderId: null });
                              } else {
                                openCancelDialog(order.id);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openCancelDialog(order.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel this order?</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel order{" "}
                                  <span className="font-semibold">
                                    {order.order_number}
                                  </span>
                                  ? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setCancelDialog({
                                      open: false,
                                      orderId: null,
                                    })
                                  }
                                  disabled={cancelLoading}
                                >
                                  No, keep order
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleConfirmCancel}
                                  disabled={cancelLoading}
                                >
                                  {cancelLoading ? "Cancelling..." : "Yes, cancel"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-4">
                  No orders yet
                </p>
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
