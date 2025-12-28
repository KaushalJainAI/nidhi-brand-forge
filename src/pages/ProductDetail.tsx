import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, Share2, Star, Loader2, Truck, Shield, RotateCcw, Minus, Plus, Check, ChevronRight, Copy, MessageCircle } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { productsAPI, reviewsAPI, Product } from "@/lib/api";
import product1 from "@/assets/product-1.jpg";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { cart, addToCart, updateQuantity: updateCartQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if product is already in cart
  const itemInCart = cart.find(item => item.id === Number(id) && item.itemType === "product");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError("");
      
      try {
        const productData = await productsAPI.getById(id);
        
        if (!productData) {
          throw new Error("Product not found");
        }
        
        setProduct(productData);
        
        try {
          const reviewsData = await reviewsAPI.getByProduct(String(productData.id));
          setReviews(reviewsData.results || reviewsData || []);
        } catch (reviewErr) {
          setReviews([]);
        }
        
        if (productData.category) {
          try {
            const similarData = await productsAPI.getByCategory(String(productData.category));
            const similarList = similarData.results || similarData || [];
            const similar = similarList
              .filter((p: Product) => p.id !== productData.id)
              .slice(0, 4);
            setSimilarProducts(similar);
          } catch (similarErr) {
            setSimilarProducts([]);
          }
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isLoggedIn) {
      window.alert("You need to log in to add items to your cart.");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: Number(product.id),
        name: product.name,
        itemType: "product" as const,
        image: product.image || product1,
        price: product.final_price || Number(product.discount_price) || Number(product.price),
        originalPrice: product.discount_price ? Number(product.price) : undefined,
      });
    }
    toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    
    const isCurrentlyFavorite = isFavorite(Number(product.id));
    
    toggleFavorite({
      id: Number(product.id),
      name: product.name,
      image: product.image || product1,
      price: product.final_price || Number(product.discount_price) || Number(product.price),
      originalPrice: product.discount_price ? Number(product.price) : undefined,
      weight: product.weight,
      badge: product.badge,
    });
    
    toast.success(isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareUrl = `${window.location.origin}/products/${id}`;
    const shareTitle = product.name;
    const shareText = `Check out ${product.name} - ₹${price}${originalPrice && originalPrice > price ? ` (Save ${discountPercent}%)` : ''}`;
    
    // Try native share first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error, fall through to copy
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareWhatsApp = () => {
    if (!product) return;
    
    const shareUrl = `${window.location.origin}/products/${id}`;
    const message = `Check out ${product.name} - ₹${price}${originalPrice && originalPrice > price ? ` (Save ${discountPercent}%)` : ''}\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatSimilarProduct = (p: Product) => ({
    id: Number(p.id),
    name: p.name,
    slug: p.slug,
    image: p.image || product1,
    price: p.final_price || Number(p.discount_price) || Number(p.price),
    originalPrice: p.discount_price ? Number(p.price) : undefined,
    weight: p.weight || "100g",
    itemType: "product" as const,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-destructive text-lg mb-6">{error || "The product you're looking for doesn't exist."}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                Go Back
              </Button>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImage = product.image || product1;
  const galleryImages = product.images?.length 
    ? [productImage, ...product.images.map((img) => img.image)]
    : [productImage];
  const rating = product.average_rating || 0;
  const reviewsCount = product.reviews_count || reviews.length;
  const price = product.final_price || Number(product.discount_price) || Number(product.price);
  const originalPrice = product.discount_price ? Number(product.price) : null;
  const discountPercent = product.discount_percentage || 
    (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const savings = originalPrice && originalPrice > price ? originalPrice - price : 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          {product.category_name && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{product.category_name}</span>
            </>
          )}
        </div>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 mb-8">
          
          {/* Image Gallery - Amazon Style */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] pb-2 sm:pb-0 sm:pr-2">
              {galleryImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 overflow-hidden transition-all ${
                    selectedImageIndex === idx 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = product1;
                    }}
                  />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 relative">
              <div className="aspect-square rounded-xl border border-border overflow-hidden bg-muted group">
                <img 
                  src={galleryImages[selectedImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = product1;
                  }}
                />
              </div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.badge && (
                  <Badge className="bg-primary text-primary-foreground">{product.badge}</Badge>
                )}
                {discountPercent > 0 && (
                  <Badge className="bg-secondary text-secondary-foreground">{discountPercent}% OFF</Badge>
                )}
              </div>
              
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-card transition-all hover:scale-110"
                aria-label={isFavorite(Number(product.id)) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 ${isFavorite(Number(product.id)) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-primary font-medium">
                {rating > 0 ? rating.toFixed(1) : "No ratings"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <Separator />

            {/* Price Section - Amazon Style */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">₹{price.toFixed(0)}</span>
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">₹{originalPrice.toFixed(0)}</span>
                    <Badge variant="secondary" className="text-sm">
                      -{discountPercent}%
                    </Badge>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  You save ₹{savings.toFixed(0)} on this purchase
                </p>
              )}
              <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Weight:</span>
                <span className="text-muted-foreground">{product.weight}</span>
              </div>
              {product.spice_form && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Form:</span>
                  <span className="text-muted-foreground">{product.spice_form}</span>
                </div>
              )}
              {product.origin_country && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Origin:</span>
                  <span className="text-muted-foreground">{product.origin_country}</span>
                </div>
              )}
              {product.shelf_life && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Shelf Life:</span>
                  <span className="text-muted-foreground">{product.shelf_life} months</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
              product.in_stock 
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" 
                : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
            }`}>
              {product.in_stock ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="font-medium">In Stock</span>
                  <span className="text-sm">({product.stock} available)</span>
                </>
              ) : (
                <span className="font-medium">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.in_stock && (
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                {itemInCart ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => updateCartQuantity(Number(id), itemInCart.quantity - 1, "product")}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-semibold">{itemInCart.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => updateCartQuantity(Number(id), itemInCart.quantity + 1, "product")}
                      disabled={itemInCart.quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">in cart</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-semibold">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 h-12" 
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12"
                onClick={handleShareWhatsApp}
                title="Share on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12"
                onClick={handleShare}
                title="Copy link"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
                <Truck className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-medium">Free Delivery</span>
                <span className="text-xs text-muted-foreground">Orders ₹500+</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-medium">Secure</span>
                <span className="text-xs text-muted-foreground">Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-medium">7 Days</span>
                <span className="text-xs text-muted-foreground">Return</span>
              </div>
            </div>

            {/* Organic Badge */}
            {product.organic && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
                <span className="text-2xl">🌿</span>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">100% Organic Certified</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Made from natural ingredients</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="max-w-4xl mb-10">
          <h2 className="text-xl font-bold mb-4">About This Product</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{product.description}</p>
          
          {product.ingredients && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Ingredients:</h3>
              <p className="text-muted-foreground">{product.ingredients}</p>
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6">Customers Also Bought</h2>
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-4">
                {similarProducts.map((p) => (
                  <CarouselItem key={p.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard {...formatSimilarProduct(p)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </section>
        )}

        {/* Reviews Section */}
        <section className="max-w-4xl">
          <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, index) => (
                        <Star 
                          key={index} 
                          className={`h-4 w-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
                        />
                      ))}
                      <span className="text-sm font-medium ml-2">{review.title || "Great Product!"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {review.user_name && <span>By {review.user_name}</span>}
                      {review.created_at && (
                        <span>• {new Date(review.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </section>
      </div>

      {/* Sticky Mobile Cart Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-3 md:hidden z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">₹{price.toFixed(0)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toFixed(0)}</span>
              )}
            </div>
            <p className={`text-xs ${product.in_stock ? "text-green-600" : "text-red-600"}`}>
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="h-10 px-6"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          {cart.length > 0 && (
            <Button size="sm" variant="secondary" asChild className="h-10 px-4">
              <Link to="/cart">
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;

