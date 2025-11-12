import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
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
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">NG</span>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
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


          {/* Search & Actions - Desktop Only */}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Button>


            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Button>
          </div>


          {/* Mobile Menu Button & Action Icons */}
          <div className="md:hidden flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/cart')}
              className="relative"
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
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>


        {/* Mobile Search - Only when menu is open */}
        {isMenuOpen && (
          <div className="py-3 border-t border-border md:hidden">
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
        )}


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
              <div className="border-t border-border pt-4">
                <button 
                  onClick={() => {
                    handleProfileClick();
                    handleNavClick();
                  }}
                  className="text-foreground hover:text-primary transition-colors font-medium text-left w-full"
                >
                  Profile
                </button>
              </div>
              <Link 
                to="/favorites"
                onClick={handleNavClick}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Wishlist
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};


export default Navbar;
