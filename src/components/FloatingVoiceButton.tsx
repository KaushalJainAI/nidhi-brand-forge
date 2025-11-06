import { Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingVoiceButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/voice-order")}
      className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
      size="icon"
      aria-label="Voice Order"
    >
      <Mic className="h-6 w-6" />
    </Button>
  );
};

export default FloatingVoiceButton;
