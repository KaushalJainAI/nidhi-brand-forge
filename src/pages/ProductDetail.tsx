import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Heart, Share2, Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext"; // Import the useCart hook
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart(); // Get addToCart from context

  // Mock product data
  const product = {
    id: id || "1",
    name: "Garadu Masala",
    image: product1,
    price: 120,
    originalPrice: 150,
    weight: "100g",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    description: "Our premium Garadu Masala is a special blend of authentic Indian spices, carefully crafted to enhance the flavor of traditional garadu dishes. Made from the finest quality ingredients, this masala brings out the perfect balance of heat and aroma.",
    ingredients: ["Coriander", "Cumin", "Red Chili", "Turmeric", "Black Pepper", "Cardamom", "Cloves", "Cinnamon"],
    benefits: [
      "100% natural ingredients",
      "No artificial colors or preservatives",
      "Freshly ground spices",
      "Traditional recipe",
      "Rich in antioxidants"
    ]
  };

  const similarProducts = [
    { id: "2", name: "Kitchen King Masala", image: product2, price: 135, originalPrice: 170, weight: "100g" },
    { id: "3", name: "Pav Bhaji Masala", image: product3, price: 125, originalPrice: 155, weight: "100g" },
    { id: "4", name: "Sambhar Masala", image: product4, price: 130, originalPrice: 160, weight: "100g" },
    { id: "5", name: "Tea Masala", image: product5, price: 95, originalPrice: 120, weight: "50g" },
  ];

  const handleAddToCart = () => {
    // Add multiple items based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
      });
    }
    toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart successfully!`);
  };

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
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm p-3 rounded-full shadow-md"
              >
                <Heart
                  className={`h-6 w-6 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
              </button>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2 max-w-md">
              {[product.image, product.image, product.image, product.image].map((img, idx) => (
                <button
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded border border-border hover:border-primary transition-colors"
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
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
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-2xl text-muted-foreground line-through">₹{product.originalPrice}</span>
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <Separator className="my-6" />

            {/* Weight & Stock */}
            <div className="space-y-2 mb-6">
              <p className="text-lg"><span className="font-semibold">Weight:</span> {product.weight}</p>
              <p className="text-lg">
                <span className="font-semibold">Availability:</span>{" "}
                <span className={product.inStock ? "text-green-600" : "text-destructive"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
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
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
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

              <h3 className="text-xl font-semibold mb-3">Key Ingredients</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {product.ingredients.map((ingredient, index) => (
                  <span key={index} className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                    {ingredient}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3">Benefits</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Products Carousel */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">People Also Buy</h2>
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {similarProducts.map((product) => (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                  <ProductCard {...product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">What is the shelf life of this product?</h3>
              <p className="text-muted-foreground">Our masalas have a shelf life of 12 months when stored in a cool, dry place away from direct sunlight.</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Is this product organic?</h3>
              <p className="text-muted-foreground">Yes, all our products are made from 100% organic and natural ingredients without any artificial additives.</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">How should I store this masala?</h3>
              <p className="text-muted-foreground">Store in an airtight container in a cool, dry place. Avoid exposure to moisture and direct sunlight.</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Do you offer bulk orders?</h3>
              <p className="text-muted-foreground">Yes, we offer special pricing for bulk orders. Please contact our customer support for more details.</p>
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
