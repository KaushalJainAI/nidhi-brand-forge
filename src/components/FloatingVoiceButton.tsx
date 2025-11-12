import { Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const FloatingVoiceButton = () => {
  const navigate = useNavigate();
  const pressTimer = useRef(null);

  const handleMouseDown = (e) => {
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
      className="fixed right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
      style={{
        // Positioned higher so Chat and Voice buttons don’t overlap footer or each other
        bottom: 'max(7rem, calc(6rem + env(safe-area-inset-bottom)))'
      }}
      size="icon"
      aria-label="Voice Order - Click or hold for 500ms"
    >
      <Mic className="h-6 w-6" />
    </Button>
  );
};

export default FloatingVoiceButton;
