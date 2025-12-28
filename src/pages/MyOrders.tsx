// MyOrders.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  MessageCircle,
  Star,
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
import { reviewsAPI } from "@/lib/api/reviews";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { state: { from: '/my-orders' } });
    }
  }, [isLoggedIn, authLoading, navigate]);

  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({
    open: false,
    orderId: null,
  });

  // New: Per-product/combo review dialog
  const [productReviewDialog, setProductReviewDialog] = useState<{
    open: boolean;
    itemType: 'product' | 'combo';
    itemId: number | null;
    itemName: string;
    orderId: number | null;
  }>({
    open: false,
    itemType: 'product',
    itemId: null,
    itemName: "",
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
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error(err);
      // Check if it's an authentication error (401 or 403)
      const status = err?.response?.status || err?.status;
      if (status === 401 || status === 403) {
        toast.error("Please login to view your orders");
      } else {
        toast.error("Failed to load orders.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refs for order cards to scroll into view
  const orderRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
            id: item.product_id,
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

  const handleChatSupport = (order: Order) => {
    // Navigate to chat support with order info
    navigate(`/chat-support?order=${order.order_number}`);
  };

  const openProductReviewDialog = (itemType: 'product' | 'combo', itemId: number, itemName: string, orderId: number) => {
    setProductReviewDialog({
      open: true,
      itemType,
      itemId,
      itemName,
      orderId,
    });
    setCurrentRating(0);
    setCurrentReview("");
  };

  const [reviewLoading, setReviewLoading] = useState(false);

  const handleSubmitProductReview = async () => {
    if (currentRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!productReviewDialog.itemId) {
      toast.error("No item selected for review");
      return;
    }

    try {
      setReviewLoading(true);
      const reviewData = {
        item_type: productReviewDialog.itemType,
        rating: currentRating,
        title: productReviewDialog.itemName,
        comment: currentReview || "",
        ...(productReviewDialog.itemType === 'product' 
          ? { product: productReviewDialog.itemId }
          : { combo: productReviewDialog.itemId }
        ),
      };
      await reviewsAPI.create(reviewData);
      toast.success(`Review submitted for ${productReviewDialog.itemName}!`);
      setProductReviewDialog({ open: false, itemType: 'product', itemId: null, itemName: "", orderId: null });
      setCurrentRating(0);
      setCurrentReview("");
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      const message = error?.message || "Failed to submit review. Please try again.";
      toast.error(message);
    } finally {
      setReviewLoading(false);
    }
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

  const isDelivered = (status: string) => {
    return status.toLowerCase() === "delivered";
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-10 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">
            My Orders
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            View and manage your orders
          </p>
        </div>
      </section>

      <section className="py-6 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading orders...
            </p>
          ) : orders.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const cancellable = isCancellable(order.status);
                const delivered = isDelivered(order.status);

                return (
                  <Card key={order.id} ref={(el) => { orderRefs.current[order.id] = el; }}>
                    <CardContent className="p-3 sm:p-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1">
                            Order {order.order_number}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
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
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => toggleExpanded(order.id)}
                            aria-label={isExpanded ? "Show less" : "Show more"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Always-visible total row */}
                      <div className="flex justify-between items-center mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
                        <span className="font-semibold text-sm sm:text-base">Total</span>
                        <span className="text-lg sm:text-xl font-bold text-primary">
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
                            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 mt-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 sm:gap-4"
                                >
                                  <img
                                    src={getProductImage(item.product_id)}
                                    alt={item.product_name}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm sm:text-base truncate">
                                      {item.product_name}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      Qty: {item.quantity} × ₹{item.price}
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      {formatCurrency(item.total)}
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
                          className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                          onClick={() => handleReorder(order)}
                          disabled={order.status.toLowerCase() === "cancelled"}
                        >
                          <Repeat className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Reorder
                        </Button>

                        {/* Chat Support Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                          onClick={() => handleChatSupport(order)}
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Support
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 hidden sm:flex"
                          onClick={() => handleDownloadBill(order.order_number)}
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Bill
                        </Button>

                        {/* Cancel for pending/in_transit OR Review for delivered */}
                        {cancellable ? (
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
                                className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                                onClick={() => openCancelDialog(order.id)}
                              >
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Cancel
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
                        ) : delivered ? (
                          <Dialog
                            open={
                              productReviewDialog.open &&
                              productReviewDialog.orderId === order.id
                            }
                            onOpenChange={(open) => {
                              if (!open) {
                                setProductReviewDialog({ open: false, itemType: 'product', itemId: null, itemName: "", orderId: null });
                                setCurrentRating(0);
                                setCurrentReview("");
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                                onClick={() => {
                                  // Open dialog with first item
                                  const firstItem = order.items[0];
                                  const itemId = firstItem.item_type === 'combo' ? firstItem.combo_id : firstItem.product_id;
                                  if (itemId) {
                                    openProductReviewDialog(firstItem.item_type, itemId, firstItem.product_name, order.id);
                                  }
                                }}
                              >
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review {productReviewDialog.itemName}</DialogTitle>
                                <DialogDescription>
                                  Share your experience with this {productReviewDialog.itemType}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {/* Product/Combo selector if multiple items */}
                              {order.items.length > 1 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium mb-2">Select Item to Review</p>
                                  <div className="flex flex-wrap gap-2">
                                    {order.items.map((item) => {
                                      const itemId = item.item_type === 'combo' ? item.combo_id : item.product_id;
                                      return (
                                        <Button
                                          key={item.id}
                                          variant={productReviewDialog.itemId === itemId ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => {
                                            if (itemId) {
                                              setProductReviewDialog(prev => ({
                                                ...prev,
                                                itemType: item.item_type,
                                                itemId: itemId,
                                                itemName: item.product_name,
                                              }));
                                            }
                                          }}
                                        >
                                          {item.product_name}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-4">
                                {/* Star Rating */}
                                <div>
                                  <p className="text-sm font-medium mb-2">Rating</p>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setCurrentRating(star)}
                                        className="focus:outline-none"
                                      >
                                        <Star
                                          className={`h-8 w-8 transition-colors ${
                                            star <= currentRating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Review Text */}
                                <div>
                                  <p className="text-sm font-medium mb-2">Your Review (optional)</p>
                                  <Textarea
                                    placeholder="Tell us what you think about this product..."
                                    value={currentReview}
                                    onChange={(e) => setCurrentReview(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                                
                                {/* Submit Button */}
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    disabled={reviewLoading}
                                    onClick={() => {
                                      setProductReviewDialog({ open: false, itemType: 'product', itemId: null, itemName: "", orderId: null });
                                      setCurrentRating(0);
                                      setCurrentReview("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSubmitProductReview} disabled={reviewLoading}>
                                    {reviewLoading ? "Submitting..." : "Submit Review"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 sm:py-16">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 text-center max-w-md">
                  Looks like you haven't placed any orders yet. Explore our amazing collection and start shopping!
                </p>
                <Link to="/products">
                  <Button className="text-sm sm:text-base">Continue Shopping</Button>
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

