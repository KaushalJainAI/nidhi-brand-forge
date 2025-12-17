import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingChatIcon = () => {
  return (
    <Link to="/chat-support">
      <Button
        size="lg"
        className="fixed right-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform z-50 
                   md:bottom-6 bottom-32"
        aria-label="Chat Support"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </Link>
  );
};

export default FloatingChatIcon;
