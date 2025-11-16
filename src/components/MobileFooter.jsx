import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Gift, Phone, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";

const footerItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Products", icon: ShoppingBag, path: "/products" },
  { label: "Offers", icon: Gift, path: "/offer-zone" },
  { label: "Contact", icon: Phone, path: "/contact" },
  { label: "About", icon: Info, path: "/about" },
];

const MobileFooterNav = () => {
  const { cart } = useCart();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 z-50 w-full bg-card border-t border-border flex justify-around md:hidden h-16">
      {footerItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link
            key={i}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1
              ${location.pathname === item.path ? "text-primary font-bold" : "text-muted-foreground"}
            `}
          >
            <span className="relative">
              <Icon className="h-6 w-6 mb-0.5" />
              {item.label === "Products" && cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, it) => sum + it.quantity, 0)}
                </span>
              )}
            </span>
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileFooterNav;
