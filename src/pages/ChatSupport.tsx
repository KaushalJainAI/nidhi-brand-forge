import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { chatAPI, ChatMessage as APIChatMessage, ChatSession } from "@/lib/api/support";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot" | "system";
  senderName?: string;
  timestamp: Date;
}

const ChatSupport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderNumber = searchParams.get("order");
  
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.error("Please login to access chat support");
      navigate('/login', { state: { from: `/chat-support${orderNumber ? `?order=${orderNumber}` : ''}` } });
    }
  }, [isLoggedIn, authLoading, navigate, orderNumber]);

  // Check for order number requirement
  useEffect(() => {
    if (!authLoading && isLoggedIn && !orderNumber) {
      setError("Please select an order from your orders page to start a support chat.");
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, orderNumber]);

  // Initialize chat session
  useEffect(() => {
    if (!isLoggedIn || authLoading || !orderNumber) return;
    
    const initSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create a new session with order number
        const newSession = await chatAPI.createSession({
          order_number: orderNumber,
          subject: `Order Support - ${orderNumber}`,
        });
        
        if (!newSession || !newSession.id) {
          throw new Error('Invalid session response');
        }
        
        setSession(newSession);
        
        // Format messages from response or fetch them
        if (newSession.messages && newSession.messages.length > 0) {
          const formattedMessages = newSession.messages.map((msg, index) => ({
            id: msg.id || index,
            text: msg.message,
            sender: msg.sender_type === 'user' ? 'user' as const : 'bot' as const,
            senderName: msg.sender_name,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(formattedMessages);
        } else {
          try {
            const msgs = await chatAPI.getMessages(newSession.id);
            if (msgs && msgs.length > 0) {
              const formattedMessages = msgs.map((msg, index) => ({
                id: msg.id || index,
                text: msg.message,
                sender: msg.sender_type === 'user' ? 'user' as const : 'bot' as const,
                senderName: msg.sender_name,
                timestamp: new Date(msg.created_at),
              }));
              setMessages(formattedMessages);
            }
          } catch {
            setMessages([{
              id: 1,
              text: `Welcome! How can we help you with order ${orderNumber}?`,
              sender: "bot",
              timestamp: new Date(),
            }]);
          }
        }
      } catch (err: any) {
        console.error("Failed to create chat session:", err);
        const errorMsg = err?.data?.order_number?.[0] || 
                        err?.data?.error || 
                        err?.message || 
                        "Failed to start chat session";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    initSession();
  }, [isLoggedIn, authLoading, orderNumber]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending || !session?.id) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setSending(true);

    try {
      await chatAPI.sendMessage(session.id, inputMessage);
      
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now(),
          text: "Thank you for your message! Our support team has been notified and will respond shortly. For immediate assistance, please call +91 93029 22251.",
          sender: "bot",
          senderName: "Support Bot",
          timestamp: new Date(),
        }]);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <div className="flex-1 container mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-8 text-center">
          Chat Support
        </h1>
        {orderNumber && (
          <p className="text-center text-muted-foreground mb-4">
            Regarding Order: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}
        
        {error ? (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unable to Start Chat</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate('/my-orders')}>
                Go to My Orders
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-4xl mx-auto h-[400px] sm:h-[600px] flex flex-col">
            <CardHeader className="border-b py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Customer Support
                {session && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Session: {session.session_id}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
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
                        className={`flex-1 max-w-[80%] sm:max-w-[70%] ${
                          message.sender === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`p-3 sm:p-4 rounded-lg ${
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
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>
            
            <div className="p-3 sm:p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1"
                  disabled={loading || sending || !session}
                />
                <Button type="submit" size="icon" disabled={loading || sending || !inputMessage.trim() || !session}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {/* Quick Contact Info */}
        <div className="max-w-4xl mx-auto mt-4 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Phone Support</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">+91 93029 22251</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Email Support</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">nidhigrahudyog@reddifmail.com</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Response Time</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Usually within 2 hours</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatSupport;
