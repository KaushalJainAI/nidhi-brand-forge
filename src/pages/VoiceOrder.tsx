import Footer from "@/components/Footer";
import { Mic } from "lucide-react";

const VoiceOrder = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col items-center justify-center">
        {/* Coming Soon Section */}
        <div className="text-center space-y-6">
          {/* Animated Mic Icon */}
          <div className="relative mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full p-8 shadow-lg">
              <Mic className="h-16 w-16" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Voice Ordering
          </h1>

          {/* Coming Soon Badge */}
          <div className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
            🚀 Coming Soon
          </div>

          {/* Description */}
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-lg text-muted-foreground">
              Soon you'll be able to order your favorite spices using just your voice!
            </p>
            <p className="text-muted-foreground">
              Simply speak your order, and our AI assistant will help you find products, 
              add them to your cart, and complete your purchase effortlessly.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-2xl mb-2">🎤</div>
              <h3 className="font-semibold text-foreground">Voice Commands</h3>
              <p className="text-sm text-muted-foreground">Order by speaking naturally</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold text-foreground">AI Powered</h3>
              <p className="text-sm text-muted-foreground">Smart product recommendations</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-foreground">Quick Checkout</h3>
              <p className="text-sm text-muted-foreground">Faster than typing</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VoiceOrder;

