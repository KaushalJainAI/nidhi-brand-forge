import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatSupport = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to Nidhi Grah Udyog. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: "Thank you for your message. Our team will assist you shortly. For immediate assistance, please call us at +91-XXXXXXXXXX or email at support@nidhigrahudhyog.com",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Chat Support</h1>
        
        <Card className="max-w-4xl mx-auto h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Customer Support
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                
                <div
                  className={`flex-1 max-w-[70%] ${
                    message.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-lg ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick Contact Info */}
        <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground">+91-XXXXXXXXXX</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@nidhigrahudhyog.com</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p className="text-sm text-muted-foreground">Usually within 2 hours</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatSupport;
