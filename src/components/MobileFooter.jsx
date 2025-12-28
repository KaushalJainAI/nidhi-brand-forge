import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Gift, Package, Mic } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const footerItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Products", icon: ShoppingBag, path: "/products" },
  { label: "Voice", icon: Mic, path: "/voice-order", isSpecial: true }, // Coming Soon feature
  { label: "Offers", icon: Gift, path: "/offer-zone" },
  { label: "Orders", icon: Package, path: "/my-orders" },
];

const MobileFooterNav = () => {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 z-50 w-full bg-card border-t border-border flex justify-around items-end md:hidden h-16 transition-all duration-300">
      {footerItems.map((item, i) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        // Voice button - special styling
        if (item.isSpecial) {
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center flex-1 -mt-5"
            >
              <Button
                onClick={() => navigate(item.path)}
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl 
                           transition-all duration-300 hover:scale-105 active:scale-95
                           animate-pulse-subtle"
                size="icon"
                aria-label="Voice Order"
              >
                <Icon className="h-6 w-6" />
              </Button>
              <span className="text-xs text-primary font-medium mt-0.5 transition-colors duration-200">{item.label}</span>
            </div>
          );
        }
        
        return (
          <Link
            key={i}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 
                        transition-all duration-200 active:scale-95
                        ${isActive 
                          ? "text-primary font-bold" 
                          : "text-muted-foreground hover:text-foreground"
                        }`}
          >
            <span className={`relative transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
              <Icon className={`h-6 w-6 mb-0.5 transition-all duration-200 ${isActive ? "drop-shadow-sm" : ""}`} />
              {item.label === "Products" && cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce-in">
                  {cart.reduce((sum, it) => sum + it.quantity, 0)}
                </span>
              )}
            </span>
            <span className={`text-xs transition-all duration-200 ${isActive ? "font-semibold" : ""}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileFooterNav;

