import { Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const FloatingVoiceButton = () => {
  const navigate = useNavigate();
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      navigate("/voice-order", { state: { autoStartMic: true } });
      return;
    }
    pressTimer.current = setTimeout(() => {
      navigate("/voice-order", { state: { autoStartMic: true } });
    }, 500);
  };

  const handleTouchStart = () => {
    pressTimer.current = setTimeout(() => {
      navigate("/voice-order", { state: { autoStartMic: true } });
    }, 500);
  };

  const handleEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  return (
    <Button
      onClick={() => navigate("/voice-order")}
      onMouseDown={handleMouseDown}
      onMouseUp={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleEnd}
      className="fixed right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40
                 md:bottom-28 bottom-52"
      size="icon"
      aria-label="Voice Order - Click or hold for 500ms"
    >
      <Mic className="h-6 w-6" />
    </Button>
  );
};

export default FloatingVoiceButton;
