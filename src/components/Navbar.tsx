import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Heart, Languages, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // Force hide Google Translate banner if it somehow appears
    const interval = setInterval(() => {
      const banner = document.querySelector('.goog-te-banner-frame') as HTMLElement;
      if (banner) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
        document.body.style.top = '0px';
        document.documentElement.style.marginTop = '0px';
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
    }
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/login', { state: { from: '/profile' } });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 border-b border-border backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-9 w-auto md:h-11"
              />
              <div className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden lg:block">
                Nidhi Grah Udyog
              </div>
            </Link>
          </div>

          {/* Optimized Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-5 lg:space-x-8">
            <Link to="/" className="text-sm lg:text-base font-semibold text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-sm lg:text-base font-semibold text-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/combos" className="text-sm lg:text-base font-semibold text-foreground hover:text-primary transition-colors">
              Combos
            </Link>
            <Link to="/offer-zone" className="text-sm lg:text-base font-semibold text-primary hover:text-primary/80 transition-colors">
              Offers
            </Link>

            {/* "More" Dropdown to free up space */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 text-sm lg:text-base font-semibold text-foreground hover:text-primary transition-colors outline-none">
                  <span>More</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/about')}>
                  About Us
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/contact')}>
                  Contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/track-order')}>
                  Track Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                  My Orders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Actions Section */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="search" 
                placeholder="Search..."
                className="pl-9 h-9 w-44 lg:w-56 bg-muted/50 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <div className="flex items-center border-l border-border pl-2 lg:pl-4 space-x-1 lg:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageToggle}
                className="h-9 px-2 flex items-center gap-1 font-bold text-primary"
              >
                <Languages className="h-4 w-4" />
                <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
              </Button>

              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={() => navigate('/favorites')}
                title="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={handleProfileClick}
                title="Account"
              >
                <User className="h-5 w-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 relative"
                onClick={() => navigate('/cart')}
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalQuantity > 0 && (
                  <span className="notranslate absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalQuantity}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Actions Only */}
          <div className="md:hidden flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLanguageToggle}
              className="text-primary font-bold"
            >
              <Languages className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/favorites')}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="notranslate absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalQuantity}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search - Compact */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              type="search" 
              placeholder="Search spices, masalas..."
              className="pl-9 h-9 w-full bg-muted/50 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

