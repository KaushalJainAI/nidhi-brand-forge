import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, MicOff } from "lucide-react";

const VoiceOrder = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your AI assistant. You can tell me what products you'd like to order, and I'll help you complete your purchase. Try saying things like 'I want to order Garam Masala' or 'Show me your best selling products'."
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, sender: "user", text: inputMessage }
      ]);
      
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "ai",
            text: "I understand you're looking for products. Let me help you with that. Would you like to see our popular masalas or do you have a specific product in mind?"
          }
        ]);
      }, 1000);
      
      setInputMessage("");
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice recognition will be implemented later
    if (!isListening) {
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Voice Ordering Assistant</h1>
          <p className="text-muted-foreground">
            Order products using natural language - just tell us what you need!
          </p>
        </div>

        {/* Chat Messages */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6 h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVoiceInput}
            className="shrink-0"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Input
            placeholder="Type your message or use voice..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {isListening && (
          <p className="text-center text-sm text-primary mt-2 animate-pulse">
            Listening... Speak now
          </p>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default VoiceOrder;
