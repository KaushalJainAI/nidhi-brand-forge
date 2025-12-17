import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { productsAPI, reviewsAPI } from "@/lib/api";
import product1 from "@/assets/product-1.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      
      try {
        const productData = await productsAPI.getById(id);
        setProduct(productData);
        
        // Fetch reviews
        try {
          const reviewsData = await reviewsAPI.getByProduct(id);
          setReviews(reviewsData.results || reviewsData || []);
        } catch {
          setReviews([]);
        }
        
        // Fetch similar products from same category
        if (productData.category) {
          try {
            const similarData = await productsAPI.getByCategory(String(productData.category));
            const similar = (similarData.results || similarData || [])
              .filter((p: any) => p.id !== productData.id)
              .slice(0, 4);
            setSimilarProducts(similar);
          } catch {
            setSimilarProducts([]);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: String(product.id),
        name: product.name,
        image: product.image || product1,
        price: product.final_price || product.discount_price || product.price,
        originalPrice: product.discount_price ? product.price : undefined,
      });
    }
    toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart successfully!`);
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite({
      id: String(product.id),
      name: product.name,
      image: product.image || product1,
      price: product.final_price || product.discount_price || product.price,
      originalPrice: product.discount_price ? product.price : undefined,
      weight: product.weight,
      badge: product.badge,
    });
    toast.success(isFavorite(String(product.id)) ? "Removed from favorites" : "Added to favorites");
  };

  const formatSimilarProduct = (p: any) => ({
    id: String(p.id),
    name: p.name,
    image: p.image || product1,
    price: p.final_price || p.discount_price || p.price,
    originalPrice: p.discount_price ? p.price : undefined,
    weight: p.weight || "100g",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
          <p className="text-destructive text-lg">{error || "Product not found"}</p>
          <Button asChild className="mt-4">
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const productImage = product.image || product1;
  const galleryImages = product.images?.length 
    ? product.images.map((img: any) => img.image)
    : [productImage, productImage, productImage, productImage];
  const rating = product.average_rating || 0;
  const reviewsCount = product.reviews_count || reviews.length;
  const price = product.final_price || product.discount_price || product.price;
  const originalPrice = product.discount_price ? product.price : null;
  const discountPercent = product.discount_percentage || 
    (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border max-w-md">
              <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm p-3 rounded-full shadow-md"
              >
                <Heart className={`h-6 w-6 ${isFavorite(String(product.id)) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2 max-w-md">
              {galleryImages.slice(0, 4).map((img: string, idx: number) => (
                <button
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded border border-border hover:border-primary transition-colors"
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-muted-foreground">({reviewsCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">₹{price}</span>
              {originalPrice && (
                <>
                  <span className="text-2xl text-muted-foreground line-through">₹{originalPrice}</span>
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {discountPercent}% OFF
                  </span>
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
                <p className="text-lg"><span className="font-semibold">Shelf Life:</span> {product.shelf_life}</p>
              )}
              <p className="text-lg">
                <span className="font-semibold">Availability:</span>{" "}
                <span className={product.in_stock !== false ? "text-green-600" : "text-destructive"}>
                  {product.in_stock !== false ? "In Stock" : "Out of Stock"}
                </span>
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.in_stock === false}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
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
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <span className="text-lg">🌿</span>
                  <span className="font-semibold">100% Organic</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products Carousel */}
        {similarProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">People Also Buy</h2>
            <Carousel opts={{ align: "start" }} className="w-full">
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
                {product.shelf_life || "Our masalas have a shelf life of 12 months when stored in a cool, dry place away from direct sunlight."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is this product organic?</AccordionTrigger>
              <AccordionContent>
                {product.organic 
                  ? "Yes, this product is made from 100% organic and natural ingredients without any artificial additives."
                  : "This product uses high-quality natural ingredients. Check the label for specific organic certifications."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How should I store this masala?</AccordionTrigger>
              <AccordionContent>
                Store in an airtight container in a cool, dry place. Avoid exposure to moisture and direct sunlight.
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
                      <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <p className="font-semibold mb-1">{review.title || "Great Product!"}</p>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  {review.user_name && <p className="text-xs text-muted-foreground mt-2">- {review.user_name}</p>}
                </div>
              )) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Ask a Question */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Have a Question?</h3>
            <p className="text-muted-foreground mb-4">Can't find the answer you're looking for? Ask us directly!</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="questionEmail">Your Email</Label>
                <Input id="questionEmail" placeholder="your@email.com" type="email" />
              </div>
              <div>
                <Label htmlFor="question">Your Question</Label>
                <Input id="question" placeholder="Type your question here..." />
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
