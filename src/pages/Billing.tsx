import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { QRCodeSVG } from "qrcode.react";
import { authAPI, cartAPI, couponsAPI, ordersAPI } from "@/lib/api";

const Billing = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ subtotal: number; tax: number; discount: number; total: number }>({
    subtotal: 0, tax: 0, discount: 0, total: 0,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Coupon, QR, and paid state
  const [couponCode, setCouponCode] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [couponMsg, setCouponMsg] = useState<string>("");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await authAPI.getProfile();
        setFormData((prev) => ({
          ...prev,
          fullName: profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.username || prev.fullName,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          state: profile.state || prev.state,
          zipCode: profile.pincode || prev.zipCode,
        }));

        const cartResp = await cartAPI.get();
        const items = cartResp.items || [];
        setCartItems(items);
        
        // Calculate summary from cart items
        const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05; // 5% tax
        setSummary({
          subtotal,
          tax,
          discount: 0,
          total: subtotal + tax,
        });
        
        // Generate payment URL
        updatePaymentUrl(subtotal + tax);
      } catch (err) {
        toast.error("Failed to load billing info");
      }
    };

    loadData();
  }, []);

  const updatePaymentUrl = (amount: number) => {
    // UPI payment URL format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
    const upiId = "spices@upi"; // Replace with actual UPI ID from backend
    const payeeName = "Spices Store";
    const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR`;
    setPaymentUrl(url);
  };

  // Coupon validation
  const handleApplyCoupon = async () => {
    setCouponMsg("");
    setCouponValid(false);
    try {
      const data = await couponsAPI.validate(couponCode);
      if (data.valid && data.discount_percent) {
        const discountAmount = (summary.subtotal * data.discount_percent) / 100;
        const newTotal = summary.subtotal + summary.tax - discountAmount;
        setSummary((s) => ({
          ...s,
          discount: discountAmount,
          total: newTotal,
        }));
        setCouponValid(true);
        setCouponMsg(`Coupon applied! ${data.discount_percent}% off`);
        toast.success(`Coupon applied! ${data.discount_percent}% off`);
        updatePaymentUrl(newTotal);
      } else {
        setSummary((s) => ({
          ...s,
          discount: 0,
          total: s.subtotal + s.tax,
        }));
        setCouponValid(false);
        setCouponMsg(data.message || "Invalid coupon");
        toast.error(data.message || "Invalid coupon");
        updatePaymentUrl(summary.subtotal + summary.tax);
      }
    } catch (e: any) {
      setCouponMsg(e.data?.message || "Could not validate coupon");
      setCouponValid(false);
      toast.error("Could not validate coupon");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    if (!hasPaid) newErrors.paid = "Please confirm payment via UPI QR before placing order";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    setIsLoading(true);
    try {
      await ordersAPI.create({
        shipping_name: formData.fullName,
        shipping_email: formData.email,
        shipping_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_pincode: formData.zipCode,
        cart_items: cartItems,
        total: summary.total,
        coupon_code: couponValid ? couponCode : undefined,
      });
      toast.success("Order placed! We will verify your payment soon.");
      navigate("/order-success");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* SHIPPING */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries({
                      fullName: "Full Name", email: "Email", phone: "Phone",
                      address: "Address", city: "City", state: "State", zipCode: "Zip Code"
                    }).map(([key, label]) => (
                      <div key={key}>
                        <Label htmlFor={key} className="text-sm">{label}</Label>
                        <Input
                          id={key}
                          value={(formData as any)[key]}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, [key]: e.target.value }))
                          }
                          required
                          className={`py-1 px-2 text-sm ${errors[key] ? "border-red-500" : ""}`}
                        />
                        {errors[key] && (<p className="text-xs text-red-500">{errors[key]}</p>)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* SUMMARY + QR + PLACE ORDER */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-muted space-y-3 text-base">
                    {cartItems.map((item: any) => (
                      <div className="py-3 flex flex-col" key={item.id || item.product_id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium text-lg">{item.name}</span>
                          <span className="font-semibold text-lg">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Quantity: {item.quantity}</span>
                          <span>Unit Cost: ₹{item.price.toFixed(2)}</span>
                          {item.weight && <span>Weight: {item.weight}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Coupon UI */}
                  <Separator className="my-3" />
                  <div className="space-y-2 my-2">
                    <Label htmlFor="coupon">Have a coupon?</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="coupon"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        />
                      </div>
                      <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                    <p className={`text-xs mt-1 ${couponValid ? "text-green-600" : "text-muted-foreground"}`}>
                      {couponMsg || "Apply code to get discount"}
                    </p>
                  </div>
                  
                  <Separator className="my-3" />
                  <div className="flex justify-between text-md my-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-md my-2">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span className="font-semibold">₹{summary.tax.toFixed(2)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-green-600 text-md my-2">
                      <span>Discount</span>
                      <span>-₹{summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-3" />
                  <div className="flex justify-between text-xl font-bold my-2">
                    <span>Total</span>
                    <span className="text-primary">₹{summary.total.toFixed(2)}</span>
                  </div>
                  
                  {/* QR Code */}
                  <Separator className="my-3"/>
                  <div className="w-full flex flex-col items-center my-4">
                    <p className="text-sm font-medium mb-2">Scan to Pay</p>
                    {paymentUrl ? (
                      <QRCodeSVG
                        value={paymentUrl}
                        size={120}
                        level="M"
                        includeMargin
                        className="rounded-lg"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Generating QR...</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground text-center mb-2">
                    Scan with your UPI app. Then check "I have paid" to proceed.
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    <input
                      type="checkbox"
                      id="hasPaid"
                      className="h-4 w-4 mr-2"
                      checked={hasPaid}
                      onChange={() => setHasPaid(v => !v)}
                    />
                    <Label htmlFor="hasPaid" className="cursor-pointer">
                      I have completed the payment
                    </Label>
                  </div>
                  {errors["paid"] && (<p className="text-xs text-red-500 text-center">{errors["paid"]}</p>)}
                  <Button
                    type="submit"
                    className="w-full mt-4 h-14 text-lg"
                    disabled={isLoading || !hasPaid}
                  >
                    {isLoading ? "Processing..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Billing;
