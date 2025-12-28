import { Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingChatIcon = () => {
  return (
    <Link to="/contact">
      <Button
        size="lg"
        className="fixed right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl 
                   transition-all duration-300 z-50 md:bottom-6 bottom-24
                   animate-pulse-subtle hover:scale-110 active:scale-95
                   hover-glow"
        aria-label="Contact Us"
      >
        <Phone className="h-6 w-6" />
      </Button>
    </Link>
  );
};

export default FloatingChatIcon;

