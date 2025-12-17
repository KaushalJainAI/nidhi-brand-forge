import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
// --- Payment method UI: Uncomment below for future gateway integration
/*
import { Tag, CreditCard, Wallet, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { paymentMethodsAPI } from "@/lib/api";
*/
import { userAPI, cartAPI } from "@/lib/api";

const RECEIVABLE_ACCOUNT_ID = 1;

type PaymentMethod = {
  id: number;
  payment_type: "UPI" | "CARD" | "NETBANKING" | "WALLET";
  is_default: boolean;
  is_active: boolean;
  upi_id?: string;
  card_last_four?: string;
  card_brand?: string;
  card_expiry_month?: number | string;
  card_expiry_year?: number | string;
  bank_name?: string;
  wallet_provider?: string;
  masked_display: string;
  created_at: string;
};

// --- Payment method form initial, for future
/*
const initialPaymentForm: Omit<PaymentMethod, "id" | "is_active" | "masked_display" | "created_at"> = {
  payment_type: "UPI",
  upi_id: "",
  card_last_four: "",
  card_brand: "",
  card_expiry_month: "",
  card_expiry_year: "",
  bank_name: "",
  wallet_provider: "",
  is_default: false,
};
*/

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

  // --- PAYMENT: Uncomment the below for future full gateway integration
  /*
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPayment, setNewPayment] = useState(initialPaymentForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  */

  // Coupon, QR, and paid state
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState(false);
  const [couponMsg, setCouponMsg] = useState<string>("");
  const [qrBase64, setQrBase64] = useState<string>("");
  const [qrLoading, setQrLoading] = useState<boolean>(true);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile = await userAPI.getProfile();
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
        setCartItems(cartResp.items || []);
        setSummary(cartResp.summary || { subtotal: 0, tax: 0, discount: 0, total: 0 });

        // --- PAYMENT: Uncomment for future
        /*
        const data = await paymentMethodsAPI.getAll();
        let arr: PaymentMethod[] = [];
        if (Array.isArray(data.results)) arr = data.results;
        else if (Array.isArray(data)) arr = data;
        setPaymentMethods(arr.filter((pm) => pm.is_active !== false));
        const def = arr.find((pm) => pm.is_default);
        setSelectedPaymentId(def ? def.id : arr.length ? arr[0].id : null);
        */

        setQrLoading(true);
        const qrResp = await fetch("/api/cart/payment_qr/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receivable_account_id: RECEIVABLE_ACCOUNT_ID,
            coupon_code: couponValid ? couponCode : undefined,
          })
        });
        const qrJson = await qrResp.json();
        setQrBase64(qrJson.qr_code_base64);
        setQrLoading(false);
      } catch {
        toast.error("Failed to load billing info or QR code");
        setQrLoading(false);
      }
    })();
    // Only refetch QR if coupon code is valid and set, or cart updates.
  }, [couponCode, couponValid]);

  // Coupon validation - checks with backend
  const handleApplyCoupon = async () => {
    setCouponMsg("");
    setCouponValid(false);
    try {
      const resp = await fetch("/api/auth/validate-coupon/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await resp.json();
      if (resp.ok && data.discount_percent) {
        setDiscount((summary.subtotal * data.discount_percent) / 100);
        setSummary((s) => ({
          ...s,
          discount: (summary.subtotal * data.discount_percent) / 100,
          total: s.subtotal + s.tax - (summary.subtotal * data.discount_percent) / 100,
        }));
        setCouponValid(true);
        setCouponMsg("Coupon applied! " + data.discount_percent + "% off");
        toast.success("Coupon applied! " + data.discount_percent + "% off");
      } else {
        setDiscount(0);
        setSummary((s) => ({
          ...s,
          discount: 0,
          total: s.subtotal + s.tax,
        }));
        setCouponValid(false);
        setCouponMsg(data.message || "Invalid coupon");
        toast.error(data.message || "Invalid coupon");
      }
    } catch (e) {
      setCouponMsg("Could not validate coupon");
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
      const resp = await fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // payment_method_id: selectedPaymentId || undefined,
          cart_items: cartItems,
          total: summary.total,
          coupon_code: couponValid ? couponCode : undefined,
        })
      });
      if (resp.ok) {
        toast.success("Order placed! We will verify your payment soon.");
        setIsLoading(false);
        navigate("/order-success");
      } else {
        toast.error("Failed to place order");
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error("Failed to place order");
      setIsLoading(false);
    }
  };

  // --- PAYMENT: Helper for icons; future use
  /*
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "CARD": return <CreditCard className="h-5 w-5" />;
      case "WALLET": return <Wallet className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };
  */

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
              {/* --- PAYMENT METHODS [COMMENTED: UNCOMMENT THIS BLOCK FOR FUTURE] --- */}
              {/*
              <Card>
                <CardHeader>
                  <CardTitle>Payment Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!selectedPaymentId ? (
                    <>
                      <Label>Choose Payment Method</Label>
                      <Select
                        value={selectedPaymentId ? String(selectedPaymentId) : ""}
                        onValueChange={val => setSelectedPaymentId(Number(val))}
                      >
                        <SelectTrigger className="w-full mb-3">
                          <SelectValue placeholder="Choose a payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(pm =>
                            <SelectItem value={String(pm.id)} key={pm.id}>
                              <div className="flex items-center space-x-2">
                                {getPaymentIcon(pm.payment_type)}
                                <span className="font-medium">{pm.masked_display}</span>
                                {pm.is_default && <Badge variant="secondary" className="ml-1"><Star className="w-3 h-3" /> Default</Badge>}
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors["payment"] && <p className="text-xs text-red-500">{errors.payment}</p>}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      {getPaymentIcon(paymentMethods.find(pm => pm.id === selectedPaymentId)?.payment_type || "")}
                      <span className="font-medium">
                        {paymentMethods.find(pm => pm.id === selectedPaymentId)?.masked_display}
                      </span>
                      {paymentMethods.find(pm => pm.id === selectedPaymentId)?.is_default &&
                        <Badge variant="secondary" className="ml-1"><Star className="w-3 h-3" /> Default</Badge>
                      }
                      <Button variant="outline" className="ml-4" onClick={() => setSelectedPaymentId(null)}>
                        Change
                      </Button>
                    </div>
                  )}
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="mt-2">
                        Add New Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <form onSubmit={handleAddPaymentMethod}>
                        <DialogHeader>
                          <DialogTitle>Add Payment Method</DialogTitle>
                          <DialogDescription>
                            Add a new payment method to your account
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="payment_type">Payment Type</Label>
                            <Select
                              value={newPayment.payment_type}
                              onValueChange={value =>
                                setNewPayment({ ...newPayment, payment_type: value as PaymentMethod["payment_type"] })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="CARD">Card</SelectItem>
                                <SelectItem value="NETBANKING">Net Banking</SelectItem>
                                <SelectItem value="WALLET">Wallet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newPayment.payment_type === "UPI" && (
                            <div className="space-y-2">
                              <Label htmlFor="upi_id">UPI ID</Label>
                              <Input
                                id="upi_id"
                                placeholder="user@paytm"
                                value={newPayment.upi_id}
                                onChange={e => setNewPayment({ ...newPayment, upi_id: e.target.value })}
                                required
                                className={formErrors.upi_id ? "border-red-500" : ""}
                              />
                              {formErrors.upi_id && (
                                <div className="text-xs text-red-500">{formErrors.upi_id}</div>
                              )}
                            </div>
                          )}
                          {newPayment.payment_type === "CARD" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="card_brand">Card Brand</Label>
                                <Select
                                  value={newPayment.card_brand}
                                  onValueChange={value =>
                                    setNewPayment({ ...newPayment, card_brand: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select card brand" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Visa">Visa</SelectItem>
                                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                                    <SelectItem value="RuPay">RuPay</SelectItem>
                                    <SelectItem value="American Express">American Express</SelectItem>
                                  </SelectContent>
                                </Select>
                                {formErrors.card_brand && (
                                  <div className="text-xs text-red-500">{formErrors.card_brand}</div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="card_last_four">Last 4 Digits</Label>
                                <Input
                                  id="card_last_four"
                                  placeholder="1234"
                                  maxLength={4}
                                  value={newPayment.card_last_four}
                                  onChange={e => setNewPayment({ ...newPayment, card_last_four: e.target.value })}
                                  required
                                  className={formErrors.card_last_four ? "border-red-500" : ""}
                                />
                                {formErrors.card_last_four && (
                                  <div className="text-xs text-red-500">{formErrors.card_last_four}</div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="expiry_month">Expiry Month</Label>
                                  <Input
                                    id="expiry_month"
                                    placeholder="MM"
                                    maxLength={2}
                                    value={newPayment.card_expiry_month as string}
                                    onChange={e =>
                                      setNewPayment({ ...newPayment, card_expiry_month: e.target.value })
                                    }
                                    required
                                    className={formErrors.card_expiry_month ? "border-red-500" : ""}
                                  />
                                  {formErrors.card_expiry_month && (
                                    <div className="text-xs text-red-500">{formErrors.card_expiry_month}</div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="expiry_year">Expiry Year</Label>
                                  <Input
                                    id="expiry_year"
                                    placeholder="YYYY"
                                    maxLength={4}
                                    value={newPayment.card_expiry_year as string}
                                    onChange={e =>
                                      setNewPayment({ ...newPayment, card_expiry_year: e.target.value })
                                    }
                                    required
                                    className={formErrors.card_expiry_year ? "border-red-500" : ""}
                                  />
                                  {formErrors.card_expiry_year && (
                                    <div className="text-xs text-red-500">{formErrors.card_expiry_year}</div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                          {newPayment.payment_type === "NETBANKING" && (
                            <div className="space-y-2">
                              <Label htmlFor="bank_name">Bank Name</Label>
                              <Input id="bank_name" placeholder="State Bank of India" value={newPayment.bank_name}
                                onChange={e => setNewPayment({ ...newPayment, bank_name: e.target.value })}
                                required className={formErrors.bank_name ? "border-red-500" : ""} />
                              {formErrors.bank_name && (<div className="text-xs text-red-500">{formErrors.bank_name}</div>)}
                            </div>
                          )}
                          {newPayment.payment_type === "WALLET" && (
                            <div className="space-y-2">
                              <Label htmlFor="wallet_provider">Wallet Provider</Label>
                              <Select
                                value={newPayment.wallet_provider}
                                onValueChange={value => setNewPayment({ ...newPayment, wallet_provider: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select wallet" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PayTM">PayTM</SelectItem>
                                  <SelectItem value="PhonePe">PhonePe</SelectItem>
                                  <SelectItem value="Google Pay">Google Pay</SelectItem>
                                  <SelectItem value="Amazon Pay">Amazon Pay</SelectItem>
                                </SelectContent>
                              </Select>
                              {formErrors.wallet_provider && (
                                <div className="text-xs text-red-500">{formErrors.wallet_provider}</div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center space-x-2 pt-2">
                            <input
                              type="checkbox"
                              id="is_default"
                              checked={newPayment.is_default}
                              onChange={e =>
                                setNewPayment({ ...newPayment, is_default: e.target.checked })
                              }
                              className="h-4 w-4"
                            />
                            <Label htmlFor="is_default" className="cursor-pointer">
                              Set as default payment method
                            </Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isAddingPayment}>
                            {isAddingPayment ? "Adding..." : "Add Payment Method"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
              */}
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
                      <div className="py-3 flex flex-col" key={item.id}>
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
                  {/* Small QR centered above Place Order */}
                  <Separator className="my-3"/>
                  <div className="w-full flex justify-center my-4">
                    {qrLoading ? (
                      <span className="text-sm text-muted-foreground">Loading QR...</span>
                    ) : (
                      qrBase64 ? (
                        <img
                          src={`data:image/png;base64,${qrBase64}`}
                          alt="UPI QR Payment"
                          style={{ width: 100, height: 100, borderRadius: 8 }}
                        />
                      ) : <span className="text-red-500 text-sm">Could not load QR</span>
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
