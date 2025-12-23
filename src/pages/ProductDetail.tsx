import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Heart, Share2, Star, Loader2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { productsAPI, reviewsAPI, Product } from "@/lib/api";
import product1 from "@/assets/product-1.jpg";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();  // ✅ Changed to id
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        // Fetch single product by ID from detail endpoint
        const productData = await productsAPI.getById(id);  // ✅ Using getById
        
        if (!productData) {
          throw new Error("Product not found");
        }
        
        setProduct(productData);
        
        // Fetch reviews using product ID
        try {
          const reviewsData = await reviewsAPI.getByProduct(String(productData.id));
          setReviews(reviewsData.results || reviewsData || []);
        } catch (reviewErr) {
          console.log("No reviews found:", reviewErr);
          setReviews([]);
        }
        
        // Fetch similar products from same category
        if (productData.category) {
          try {
            const similarData = await productsAPI.getByCategory(String(productData.category));
            const similarList = similarData.results || similarData || [];
            const similar = similarList
              .filter((p: Product) => p.id !== productData.id)
              .slice(0, 4);
            setSimilarProducts(similar);
          } catch (similarErr) {
            console.log("No similar products found:", similarErr);
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
  }, [id]);  // ✅ Changed dependency to id

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: String(product.id),
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
    
    const isCurrentlyFavorite = isFavorite(String(product.id));
    
    toggleFavorite({
      id: String(product.id),
      name: product.name,
      image: product.image || product1,
      price: product.final_price || Number(product.discount_price) || Number(product.price),
      originalPrice: product.discount_price ? Number(product.price) : undefined,
      weight: product.weight,
      badge: product.badge,
    });
    
    toast.success(isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = () => {
    if (!product) return;
    
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: url,
      }).catch(() => {
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const formatSimilarProduct = (p: Product) => ({
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    image: p.image || product1,
    price: p.final_price || Number(p.discount_price) || Number(p.price),
    originalPrice: p.discount_price ? Number(p.price) : undefined,
    weight: p.weight || "100g",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
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
      <div className="min-h-screen bg-background">
        <Navbar />
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
    ? product.images.map((img) => img.image)
    : [productImage];
  const rating = product.average_rating || 0;
  const reviewsCount = product.reviews_count || reviews.length;
  const price = product.final_price || Number(product.discount_price) || Number(product.price);
  const originalPrice = product.discount_price ? Number(product.price) : null;
  const discountPercent = product.discount_percentage || 
    (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span className="mx-2">/</span>
          {product.category_name && (
            <>
              <span className="text-foreground">{product.category_name}</span>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img 
                src={productImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = product1;
                }}
              />
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-card transition-colors"
                aria-label={isFavorite(String(product.id)) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-6 w-6 ${isFavorite(String(product.id)) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
              
              {product.badge && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {product.badge}
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded border border-border hover:border-primary transition-colors bg-muted"
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
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} 
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {rating > 0 ? rating.toFixed(1) : "No rating"} ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-primary">₹{price.toFixed(2)}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="text-xl md:text-2xl text-muted-foreground line-through">₹{originalPrice.toFixed(2)}</span>
                  {discountPercent > 0 && (
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {discountPercent}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            <Separator className="my-6" />

            {/* Weight & Stock */}
            <div className="space-y-2 mb-6">
              <p className="text-lg"><span className="font-semibold">Weight:</span> {product.weight}</p>
              {product.spice_form && (
                <p className="text-lg"><span className="font-semibold">Form:</span> {product.spice_form}</p>
              )}
              {product.origin_country && (
                <p className="text-lg"><span className="font-semibold">Origin:</span> {product.origin_country}</p>
              )}
              {product.shelf_life && (
                <p className="text-lg"><span className="font-semibold">Shelf Life:</span> {product.shelf_life} months</p>
              )}
              <p className="text-lg">
                <span className="font-semibold">Availability:</span>{" "}
                <span className={product.in_stock ? "text-green-600 font-semibold" : "text-destructive font-semibold"}>
                  {product.in_stock ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.in_stock}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={!product.in_stock || quantity >= product.stock}
                >
                  +
                </Button>
              </div>
              {quantity >= product.stock && product.in_stock && (
                <span className="text-sm text-muted-foreground">Max available</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleAddToCart} 
                disabled={!product.in_stock || product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.in_stock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

              {product.ingredients && (
                <>
                  <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                  <p className="text-muted-foreground mb-6">{product.ingredients}</p>
                </>
              )}

              {product.organic && (
                <div className="flex items-center gap-2 text-green-600 mb-4 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <span className="text-lg">🌿</span>
                  <span className="font-semibold">100% Organic Certified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products Carousel */}
        {similarProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">People Also Buy</h2>
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent>
                {similarProducts.map((p) => (
                  <CarouselItem key={p.id} className="md:basis-1/2 lg:basis-1/4">
                    <ProductCard {...formatSimilarProduct(p)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* FAQ & Reviews Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">FAQs & Reviews</h2>
          
          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is the shelf life of this product?</AccordionTrigger>
              <AccordionContent>
                {product.shelf_life 
                  ? `This product has a shelf life of ${product.shelf_life} months when stored in a cool, dry place away from direct sunlight.`
                  : "Our masalas have a shelf life of 12 months when stored in a cool, dry place away from direct sunlight."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is this product organic?</AccordionTrigger>
              <AccordionContent>
                {product.organic 
                  ? "Yes, this product is made from 100% organic and natural ingredients without any artificial additives or preservatives."
                  : "This product uses high-quality natural ingredients. Check the product label for specific organic certifications."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How should I store this masala?</AccordionTrigger>
              <AccordionContent>
                Store in an airtight container in a cool, dry place. Avoid exposure to moisture and direct sunlight to maintain freshness and flavor for the entire shelf life.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What is the return policy?</AccordionTrigger>
              <AccordionContent>
                We offer a 7-day return policy for unopened products. If you're not satisfied with your purchase, please contact our customer support for assistance.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Reviews */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map((review: any) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, index) => (
                      <Star 
                        key={index} 
                        className={`h-4 w-4 ${index < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} 
                      />
                    ))}
                  </div>
                  <p className="font-semibold mb-1">{review.title || "Great Product!"}</p>
                  <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                  <div className="flex items-center justify-between">
                    {review.user_name && (
                      <p className="text-xs text-muted-foreground">- {review.user_name}</p>
                    )}
                    {review.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>

          {/* Ask a Question */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Have a Question?</h3>
            <p className="text-muted-foreground mb-4">Can't find the answer you're looking for? Ask us directly and we'll get back to you!</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="questionEmail">Your Email *</Label>
                <Input id="questionEmail" placeholder="your@email.com" type="email" required />
              </div>
              <div>
                <Label htmlFor="question">Your Question *</Label>
                <Input id="question" placeholder="Type your question here..." required />
              </div>
              <Button className="w-full">Submit Question</Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
