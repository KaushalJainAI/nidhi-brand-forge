import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import MyOrders from "./pages/MyOrders";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import OrderSuccess from "./pages/OrderSuccess";
import OfferZone from "./pages/OfferZone";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Billing from "./pages/Billing";
import ChatSupport from "./pages/ChatSupport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import VoiceOrder from "./pages/VoiceOrder";
import FloatingChatIcon from "./components/FloatingChatIcon";
import FloatingVoiceButton from "./components/FloatingVoiceButton";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import ScrollToTop from "./functions/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <FavoritesProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/chat-support" element={<ChatSupport />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/voice-order" element={<VoiceOrder />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/offer-zone" element={<OfferZone />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingChatIcon />
            <FloatingVoiceButton />
          </BrowserRouter>
          </AuthProvider>
        </FavoritesProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
