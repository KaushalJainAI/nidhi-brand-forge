// Billing.tsx - CORRECTED VERSION
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { authAPI, cartAPI, ordersAPI } from "@/lib/api.ts";
import { receivableAccountsAPI } from "@/lib/api/recievableAccounts.ts";
import QRCode from "qrcode";

const Billing = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartSummary, setCartSummary] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Payment state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [hasPaid, setHasPaid] = useState(false);
  const [receivableAccount, setReceivableAccount] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Load receivable accounts
        const accountsResponse = await receivableAccountsAPI.getAll();
        const accounts = Array.isArray(accountsResponse) 
          ? accountsResponse 
          : (accountsResponse as any).results || [accountsResponse];
        
        if (!accounts || accounts.length === 0) {
          toast.error("Payment system not configured. Please contact support.");
          return;
        }
        
        const account = accounts[0];
        setReceivableAccount(account);

        // 2. Load user profile
        const profile = await authAPI.getProfile();
        setFormData((prev) => ({
          ...prev,
          fullName: profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile.username || prev.fullName,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          state: profile.state || prev.state,
          zipCode: profile.pincode || prev.zipCode,
        }));

        // 3. Load cart
        const cartResp = await cartAPI.get();
        const items = cartResp.items || [];
        
        if (items.length === 0) {
          toast.error("Your cart is empty");
          navigate("/cart");
          return;
        }
        
        setCartItems(items);
        
        // 4. Calculate initial summary
        const subtotal = items.reduce(
          (acc: number, item: any) => acc + (item.price * item.quantity), 
          0
        );
        
        const shipping = subtotal >= 500 ? 0 : 50;
        const tax = subtotal * 0.05;
        
        setCartSummary({
          subtotal,
          discount: 0,
          shipping,
          tax,
          total: subtotal + shipping + tax,
        });

        // 5. Generate initial payment QR
        await generatePaymentQRCode(account, subtotal + shipping + tax);
        
      } catch (err: any) {
        console.error('Failed to load billing info:', err);
        const errorMsg = err.data?.error || err.message || "Failed to load billing data";
        toast.error(errorMsg);
      }
    };

    loadData();
  }, []);

  const generatePaymentQRCode = async (account: any, amount: number, transactionNote: string = "Cart Payment") => {
    try {
      const upi_uri = `upi://pay?pa=${account.upi_id}&pn=${encodeURIComponent(account.account_holder_name)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      
      setPaymentUrl(upi_uri);
      
      const qrDataUrl = await QRCode.toDataURL(upi_uri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeDataUrl(qrDataUrl);
      
    } catch (error: any) {
      console.error('Failed to generate payment QR:', error);
      toast.error('Failed to generate payment QR');
      throw error;
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!receivableAccount || !cartSummary) {
      toast.error("Payment system not initialized");
      return;
    }

    try {
      // Use the validate_coupon endpoint from your OrderViewSet
      const response = await ordersAPI.validateCoupon(couponCode.trim());
      
      if (!response.valid) {
        toast.error(response.message || response.error || "Invalid coupon code");
        return;
      }

      // Update summary with backend-calculated values
      setCartSummary({
        subtotal: response.subtotal,
        discount: response.discount_amount,
        shipping: response.shipping_charge,
        tax: response.tax,
        total: response.total_amount,
      });
      
      setAppliedCoupon({
        code: response.coupon_code,
        discount_type: response.discount_type,
        discount_value: response.discount_value,
      });
      
      // Generate QR with discounted amount
      const transactionNote = `Cart Payment (Coupon: ${couponCode.trim()})`;
      await generatePaymentQRCode(receivableAccount, response.total_amount, transactionNote);
      
      toast.success(`Coupon applied! ₹${response.savings.toFixed(2)} saved`);
      
    } catch (error: any) {
      console.error('Coupon application error:', error);
      const errorMsg = error.data?.error || error.data?.message || "Could not apply coupon";
      toast.error(errorMsg);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!cartSummary || !receivableAccount) return;
    
    try {
      setCouponCode("");
      setAppliedCoupon(null);
      
      // Recalculate without coupon
      const subtotal = cartSummary.subtotal;
      const shipping = subtotal >= 500 ? 0 : 50;
      const tax = subtotal * 0.05;
      const total = subtotal + shipping + tax;
      
      setCartSummary({
        subtotal,
        discount: 0,
        shipping,
        tax,
        total,
      });
      
      await generatePaymentQRCode(receivableAccount, total);
      toast.success("Coupon removed");
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Invalid phone number";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }
    
    if (!hasPaid) {
      newErrors.paid = "Please confirm payment via UPI QR before placing order";
    }
    
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
      // Build the shipping address string as expected by backend
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}`;
      
      // Send data matching OrderCreateSerializer fields
      await ordersAPI.create({
        shipping_address: fullAddress,  // Changed from individual fields
        phone_number: formData.phone,   // Changed from 'phone'
        payment_method: 'ONLINE',       // Changed from undefined
        coupon_code: appliedCoupon?.code || undefined,
      });
      
      toast.success("Order placed! We will verify your payment soon.");
      navigate("/order-success");
      
    } catch (err: any) {
      console.error('Order creation error:', err);
      const errorMsg = err.data?.error || err.data?.message || "Failed to place order";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!cartSummary) {
    return (
      <>
        <div className="container py-8 max-w-6xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-6xl pb-24 md:pb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-10">
            {/* SHIPPING */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-8">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4">
                    {Object.entries({
                      fullName: "Full Name", 
                      email: "Email", 
                      phone: "Phone",
                      address: "Address", 
                      city: "City", 
                      state: "State", 
                      zipCode: "Zip Code"
                    }).map(([key, label]) => (
                      <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
                        <Label htmlFor={key} className="text-xs sm:text-sm font-medium">
                          {label} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={key}
                          value={(formData as any)[key]}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, [key]: e.target.value }))
                          }
                          required
                          className={`mt-1 h-9 sm:h-10 text-sm ${errors[key] ? "border-red-500" : ""}`}
                        />
                        {errors[key] && (
                          <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* SUMMARY + QR + PLACE ORDER */}
            <div>
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                  {/* Cart Items */}
                  <div className="divide-y divide-muted space-y-2 sm:space-y-3 text-sm sm:text-base">
                    {cartItems.map((item: any) => (
                      <div className="py-2 sm:py-3 flex flex-col" key={`${item.item_type || 'product'}-${item.product_id || item.id}`}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{item.name}</span>
                          <span className="font-semibold text-sm sm:text-base">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-0.5 sm:mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span>₹{item.price.toFixed(2)}/unit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Coupon UI */}
                  <Separator className="my-3 sm:my-4" />
                  <div className="space-y-2">
                    <Label htmlFor="coupon" className="text-xs sm:text-sm font-medium">
                      Have a coupon?
                    </Label>
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          placeholder="Enter code"
                          className="flex-1 h-9 sm:h-10 text-sm"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim()}
                        >
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 p-2 sm:p-3 rounded-md border border-green-200">
                        <span className="text-xs sm:text-sm text-green-700 font-medium">
                          {appliedCoupon.code} applied ✓
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 sm:h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleRemoveCoupon}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Summary */}
                  <Separator className="my-3 sm:my-4" />
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{cartSummary.subtotal.toFixed(2)}</span>
                    </div>
                    {cartSummary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{cartSummary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">
                        {cartSummary.shipping === 0 ? 'FREE' : `₹${cartSummary.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span className="font-semibold">₹{cartSummary.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{cartSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <Separator className="my-3 sm:my-4"/>
                  <div className="w-full flex flex-col items-center">
                    <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                      Scan to Pay ₹{cartSummary.total.toFixed(2)}
                    </p>
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-lg border-2 border-gray-300 p-1 sm:p-2 bg-white"
                      />
                    ) : (
                      <div className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                          <span className="text-muted-foreground text-xs">Loading QR...</span>
                        </div>
                      </div>
                    )}
                    {paymentUrl && (
                      <a
                        href={paymentUrl}
                        className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Pay via UPI App
                      </a>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center my-2 sm:my-3">
                    Scan QR or click button above, then confirm payment below
                  </div>
                  
                  {/* Payment Confirmation */}
                  <div className="flex items-center justify-center p-2 sm:p-3 bg-gray-50 rounded-md border">
                    <input
                      type="checkbox"
                      id="hasPaid"
                      className="h-4 w-4 mr-2 cursor-pointer accent-blue-600"
                      checked={hasPaid}
                      onChange={() => setHasPaid(v => !v)}
                    />
                    <Label htmlFor="hasPaid" className="cursor-pointer font-medium text-xs sm:text-sm">
                      I have completed the payment
                    </Label>
                  </div>
                  
                  {errors["paid"] && (
                    <p className="text-xs text-red-500 text-center mt-2">{errors["paid"]}</p>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full mt-3 sm:mt-4 h-10 sm:h-12 text-sm sm:text-base font-semibold"
                    disabled={isLoading || !hasPaid}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      "Place Order"
                    )}
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
