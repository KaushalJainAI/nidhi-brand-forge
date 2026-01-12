import { Mic } from "lucide-react";

const VoiceOrder = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col pb-24 md:pb-8 overflow-x-hidden">
      <div className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        {/* Coming Soon Section */}
        <div className="text-center space-y-4 sm:space-y-6 w-full">
          {/* Animated Mic Icon */}
          <div className="relative mx-auto w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full p-5 sm:p-7 md:p-8 shadow-lg w-full h-full flex items-center justify-center">
              <Mic className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground px-2">
            Voice Ordering
          </h1>

          {/* Coming Soon Badge */}
          <div className="inline-block bg-accent text-accent-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
            🚀 Coming Soon
          </div>

          {/* Description */}
          <div className="max-w-md mx-auto space-y-2 sm:space-y-4 px-3">
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Soon you'll be able to order your favorite spices using just your voice!
            </p>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Simply speak your order, and our AI assistant will help you find products, 
              add them to your cart, and complete your purchase effortlessly.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 w-full max-w-2xl mx-auto px-2">
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
              <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">🎤</div>
              <h3 className="font-semibold text-foreground text-[10px] sm:text-xs md:text-base leading-tight">Voice Commands</h3>
              <p className="text-[9px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block mt-1">Order by speaking naturally</p>
            </div>
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
              <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">🤖</div>
              <h3 className="font-semibold text-foreground text-[10px] sm:text-xs md:text-base leading-tight">AI Powered</h3>
              <p className="text-[9px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block mt-1">Smart product recommendations</p>
            </div>
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
              <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">⚡</div>
              <h3 className="font-semibold text-foreground text-[10px] sm:text-xs md:text-base leading-tight">Quick Checkout</h3>
              <p className="text-[9px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block mt-1">Faster than typing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceOrder;
