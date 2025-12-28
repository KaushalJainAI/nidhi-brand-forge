import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Trash2, Star, Wallet } from "lucide-react";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { paymentMethodsAPI, userAPI } from "@/lib/api";

// --- Types ---
interface PaymentMethod {
  id: number;
  payment_type: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
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
}

const initialPaymentForm = {
  payment_type: 'UPI' as PaymentMethod["payment_type"],
  upi_id: '',
  card_last_four: '',
  card_brand: '',
  card_expiry_month: '',
  card_expiry_year: '',
  bank_name: '',
  wallet_provider: '',
  is_default: false,
};

const Profile = () => {
  // Profile info and states
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Add Payment
  const [openDialog, setOpenDialog] = useState(false);
  const [newPayment, setNewPayment] = useState(initialPaymentForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // Change password section
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await Promise.all([fetchProfile(), fetchPaymentMethods()]);
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, []);

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      setProfile(data);
    } catch {
      toast.error("Failed to load profile");
    }
  };

  // Fetch Payment Methods (handles DRF pagination)
  const fetchPaymentMethods = async () => {
    setIsLoadingPayments(true);
    try {
      const data = await paymentMethodsAPI.getAll();
      if (Array.isArray(data.results)) {
        setPaymentMethods(data.results);
      } else if (Array.isArray(data)) {
        setPaymentMethods(data);
      } else {
        setPaymentMethods([]);
      }
    } catch {
      setPaymentMethods([]);
      toast.error("Failed to load payment methods");
    } finally {
      setIsLoadingPayments(false);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userAPI.updateProfile(profile);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Change Password (using POST /change-password/)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmNewPassword) {
      setPwdError("All fields required");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      setPwdError("Passwords do not match");
      return;
    }
    setIsChangingPassword(true);
    try {
      await userAPI.changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      setPwdSuccess("Password changed successfully!");
      setPwdForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setPwdError(err?.detail || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ------- FIX IS HERE -------
  const validatePaymentForm = () => {
    const errs: Record<string, string> = {};
    if (newPayment.payment_type === "UPI") {
      if (!newPayment.upi_id.trim()) errs.upi_id = "UPI ID is required";
    } else if (newPayment.payment_type === "CARD") {
      if (!newPayment.card_brand.trim()) errs.card_brand = "Card brand required";
      if (!newPayment.card_last_four.trim() || newPayment.card_last_four.length !== 4) errs.card_last_four = "Last 4 digits required";
      if (!newPayment.card_expiry_month.trim() || isNaN(Number(newPayment.card_expiry_month)) || Number(newPayment.card_expiry_month) < 1 || Number(newPayment.card_expiry_month) > 12) errs.card_expiry_month = "Valid month required";
      if (!newPayment.card_expiry_year.trim() || newPayment.card_expiry_year.length !== 4) errs.card_expiry_year = "Year required";
    } else if (newPayment.payment_type === "NETBANKING") {
      if (!newPayment.bank_name.trim()) errs.bank_name = "Bank name required";
    } else if (newPayment.payment_type === "WALLET") {
      if (!newPayment.wallet_provider.trim()) errs.wallet_provider = "Wallet provider required";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!validatePaymentForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }
    setIsAddingPayment(true);
    try {
      let paymentData: any = {
        payment_type: newPayment.payment_type,
        is_default: newPayment.is_default,
      };
      if (newPayment.payment_type === "UPI") {
        paymentData.upi_id = newPayment.upi_id;
      } else if (newPayment.payment_type === "CARD") {
        paymentData.card_last_four = newPayment.card_last_four;
        paymentData.card_brand = newPayment.card_brand;
        paymentData.card_expiry_month = Number(newPayment.card_expiry_month);
        paymentData.card_expiry_year = Number(newPayment.card_expiry_year);
        paymentData.gateway_token = `tok_${Date.now()}`;
        paymentData.gateway_name = "razorpay";
      } else if (newPayment.payment_type === "NETBANKING") {
        paymentData.bank_name = newPayment.bank_name;
      } else if (newPayment.payment_type === "WALLET") {
        paymentData.wallet_provider = newPayment.wallet_provider;
      }
      await paymentMethodsAPI.create(paymentData);
      toast.success("Payment method added!");
      setOpenDialog(false);
      await fetchPaymentMethods();
      setNewPayment(initialPaymentForm);
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || "Failed to add payment method");
    } finally {
      setIsAddingPayment(false);
      setFormErrors({});
    }
  };
  // --------------------------

  // Remove Payment
  const handleRemovePaymentMethod = async (id) => {
    try {
      await paymentMethodsAPI.delete(id);
      toast.success("Payment method removed.");
      await fetchPaymentMethods();
    } catch {
      toast.error("Failed to remove payment method");
    }
  };

  // Set default payment method
  const handleSetDefault = async (id) => {
    try {
      await paymentMethodsAPI.setDefault(id);
      toast.success("Default payment method updated!");
      await fetchPaymentMethods();
    } catch {
      toast.error("Failed to set default payment method");
    }
  };

  // Payment icon helper
  const getPaymentIcon = (type) => {
    switch (type) {
      case "CARD":
        return <CreditCard className="h-5 w-5" />;
      case "WALLET":
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  // Logout with redirect
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // --- Render ---
  // Show loading spinner while initial data is being fetched
  if (isInitialLoading) {
    return (
      <>
        <div className="container py-4 sm:py-8 px-3 sm:px-4 pb-24 md:pb-8 min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground text-sm">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="container py-4 sm:py-8 px-3 sm:px-4 pb-24 md:pb-8">
        <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs sm:text-sm">Payment</TabsTrigger>
          </TabsList>
          {/* --- Profile Section --- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Profile Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Update your account information</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profile.phone || ""} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={profile.address || ""} onChange={e => setProfile({ ...profile, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="city" className="text-xs sm:text-sm">City</Label>
                      <Input id="city" className="h-9 sm:h-10 text-sm" value={profile.city || ""} onChange={e => setProfile({ ...profile, city: e.target.value })} />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="state" className="text-xs sm:text-sm">State</Label>
                      <Input id="state" className="h-9 sm:h-10 text-sm" value={profile.state || ""} onChange={e => setProfile({ ...profile, state: e.target.value })} />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="pincode" className="text-xs sm:text-sm">Pincode</Label>
                      <Input id="pincode" className="h-9 sm:h-10 text-sm" value={profile.pincode || ""} onChange={e => setProfile({ ...profile, pincode: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <Button type="submit" disabled={isLoading} className="w-1/2 h-10 sm:h-12 text-sm">
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                    <Button variant="destructive" type="button" onClick={handleLogout} className="w-1/2 h-10 sm:h-12 text-sm">
                      Logout
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {/* --- Security Section (Change password) --- */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <form onSubmit={handleChangePassword} className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} autoComplete="current-password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} autoComplete="new-password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input id="confirmNewPassword" type="password" value={pwdForm.confirmNewPassword} onChange={e => setPwdForm({ ...pwdForm, confirmNewPassword: e.target.value })} autoComplete="new-password" />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                  {pwdError && <div className="text-xs text-red-500 mt-2">{pwdError}</div>}
                  {pwdSuccess && <div className="text-xs text-green-500 mt-2">{pwdSuccess}</div>}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {/* --- Payment Section --- */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPayments ? (
                  <p className="text-center text-muted-foreground py-8">Loading payment methods...</p>
                ) : !Array.isArray(paymentMethods) || paymentMethods.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payment methods added yet</p>
                ) : (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          {getPaymentIcon(method.payment_type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{method.masked_display}</p>
                              {method.is_default && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{method.payment_type.toLowerCase()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!method.is_default && (
                            <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                              Set Default
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleRemovePaymentMethod(method.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="ml-7 text-xs text-muted-foreground">
                        {method.payment_type === "UPI" && <span>UPI ID: {method.upi_id}</span>}
                        {method.payment_type === "CARD" && (
                          <>
                            <span>
                              {method.card_brand} ending in {method.card_last_four}
                              {method.card_expiry_month && method.card_expiry_year
                                ? `, Expires ${method.card_expiry_month}/${method.card_expiry_year}`
                                : ""}
                            </span>
                          </>
                        )}
                        {method.payment_type === "NETBANKING" && <span>Bank: {method.bank_name}</span>}
                        {method.payment_type === "WALLET" && <span>Provider: {method.wallet_provider}</span>}
                      </div>
                    </div>
                  ))
                )}
                {/* Add Payment Dialog */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Add New Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleAddPaymentMethod}>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>Add a new payment method to your account</DialogDescription>
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
                        {/* UPI */}
                        {newPayment.payment_type === "UPI" && (
                          <div className="space-y-2">
                            <Label htmlFor="upi_id">UPI ID</Label>
                            <Input id="upi_id" placeholder="user@paytm" value={newPayment.upi_id} onChange={e => setNewPayment({ ...newPayment, upi_id: e.target.value })} required className={formErrors.upi_id ? "border-red-500" : ""} />
                            {formErrors.upi_id && <div className="text-xs text-red-500">{formErrors.upi_id}</div>}
                          </div>
                        )}
                        {/* CARD */}
                        {newPayment.payment_type === "CARD" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="card_brand">Card Brand</Label>
                              <Select value={newPayment.card_brand} onValueChange={value => setNewPayment({ ...newPayment, card_brand: value })}>
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
                              {formErrors.card_brand && <div className="text-xs text-red-500">{formErrors.card_brand}</div>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="card_last_four">Last 4 Digits</Label>
                              <Input id="card_last_four" placeholder="1234" maxLength={4} value={newPayment.card_last_four} onChange={e => setNewPayment({ ...newPayment, card_last_four: e.target.value })} required className={formErrors.card_last_four ? "border-red-500" : ""} />
                              {formErrors.card_last_four && <div className="text-xs text-red-500">{formErrors.card_last_four}</div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry_month">Expiry Month</Label>
                                <Input id="expiry_month" placeholder="MM" maxLength={2} value={newPayment.card_expiry_month} onChange={e => setNewPayment({ ...newPayment, card_expiry_month: e.target.value })} required className={formErrors.card_expiry_month ? "border-red-500" : ""} />
                                {formErrors.card_expiry_month && <div className="text-xs text-red-500">{formErrors.card_expiry_month}</div>}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="expiry_year">Expiry Year</Label>
                                <Input id="expiry_year" placeholder="YYYY" maxLength={4} value={newPayment.card_expiry_year} onChange={e => setNewPayment({ ...newPayment, card_expiry_year: e.target.value })} required className={formErrors.card_expiry_year ? "border-red-500" : ""} />
                                {formErrors.card_expiry_year && <div className="text-xs text-red-500">{formErrors.card_expiry_year}</div>}
                              </div>
                            </div>
                          </>
                        )}
                        {/* NETBANKING */}
                        {newPayment.payment_type === "NETBANKING" && (
                          <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input id="bank_name" placeholder="State Bank of India" value={newPayment.bank_name} onChange={e => setNewPayment({ ...newPayment, bank_name: e.target.value })} required className={formErrors.bank_name ? "border-red-500" : ""} />
                            {formErrors.bank_name && <div className="text-xs text-red-500">{formErrors.bank_name}</div>}
                          </div>
                        )}
                        {/* WALLET */}
                        {newPayment.payment_type === "WALLET" && (
                          <div className="space-y-2">
                            <Label htmlFor="wallet_provider">Wallet Provider</Label>
                            <Select value={newPayment.wallet_provider} onValueChange={value => setNewPayment({ ...newPayment, wallet_provider: value })}>
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
                            {formErrors.wallet_provider && <div className="text-xs text-red-500">{formErrors.wallet_provider}</div>}
                          </div>
                        )}
                        <div className="flex items-center space-x-2 pt-2">
                          <input type="checkbox" id="is_default" checked={newPayment.is_default} onChange={e => setNewPayment({ ...newPayment, is_default: e.target.checked })} className="h-4 w-4" />
                          <Label htmlFor="is_default" className="cursor-pointer">Set as default payment method</Label>
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
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
