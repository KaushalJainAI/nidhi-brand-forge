import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { cart } = useCart();
  const { isLoggedIn } = useAuth();

  // Calculate total quantity
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setIsMenuOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/login', { state: { from: '/profile' } });
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">NG</span>
            </div>
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
              Nidhi Grah Udyog
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-colors font-medium">
              Products
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About Us
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </Link>
            <Link to="/my-orders" className="text-foreground hover:text-primary transition-colors font-medium">
              My Orders
            </Link>
            <Link to="/offer-zone" className="text-foreground hover:text-primary transition-colors font-medium">
              Offers
            </Link>
          </div>

          {/* Desktop Search & Actions */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="search" 
                  placeholder="Search products..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/favorites')}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleProfileClick}
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/cart')}
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Action Icons */}
          <div className="md:hidden flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/favorites')}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleProfileClick}
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/cart')}
              className="relative"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - Always Visible */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="search" 
                placeholder="Search products..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="py-4 border-t border-border md:hidden">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                onClick={handleNavClick}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                to="/products" 
                onClick={handleNavClick}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Products
              </Link>
              <Link 
                to="/about" 
                onClick={handleNavClick}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                onClick={handleNavClick}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Contact
              </Link>
              <Link 
                to="/my-orders" 
                onClick={handleNavClick}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                My Orders
              </Link>
              <Link 
                to="/offer-zone" 
                onClick={handleNavClick}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Offers
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
