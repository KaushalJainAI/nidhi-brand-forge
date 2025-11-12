import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingChatIcon = () => {
  return (
    <Link to="/chat-support">
      <Button
        size="lg"
        className="fixed right-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        style={{
          // Ensures the button doesn't overlap with footers or safe areas
          bottom: 'max(1.5rem, env(safe-area-inset-bottom))'
        }}
        aria-label="Chat Support"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </Link>
  );
};

export default FloatingChatIcon;
