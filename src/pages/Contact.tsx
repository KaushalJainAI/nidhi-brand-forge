import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { contactAPI } from "@/lib/api/support";
import DOMPurify from "dompurify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactAPI.submit({
        name: DOMPurify.sanitize(formData.name),
        email: DOMPurify.sanitize(formData.email),
        phone: DOMPurify.sanitize(formData.phone),
        subject: DOMPurify.sanitize(formData.subject) || "General Inquiry",
        message: DOMPurify.sanitize(formData.message),
      });
      toast.success("Thank you! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Failed to submit contact form:", error);
      toast.error(error?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    {
      icon: <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Address",
      lines: ["7, Industrial Area, Runija Road, Barnagar.", "PIN-456771 · Ujjain, MP, India"],
    },
    {
      icon: <Phone className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Phone",
      lines: ["+91 93029 22251"],
    },
    {
      icon: <Mail className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Email",
      lines: ["nidhigrahudyog@reddifmail.com"],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--backdrop-spice)" }} aria-hidden />
        <span aria-hidden className="pointer-events-none absolute left-[8%] top-[28%] text-4xl sm:text-5xl animate-float" style={{ ["--rot" as string]: "-10deg" }}>📨</span>
        <span aria-hidden className="pointer-events-none absolute right-[10%] top-[24%] text-3xl sm:text-5xl animate-float" style={{ ["--rot" as string]: "12deg", animationDelay: "0.9s" }}>🌶️</span>
        <div className="relative container mx-auto px-4 py-12 sm:py-20 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/70 px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> We'd love to hear from you
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Get in{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-lg text-muted-foreground">
              Questions, bulk orders or feedback — our team is here to help.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-card p-5 sm:p-8 animate-fade-in-up">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      className="h-10 rounded-xl text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      className="h-10 rounded-xl text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      className="h-10 rounded-xl text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      required
                      className="h-10 rounded-xl text-sm"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What's this about?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    required
                    className="text-sm rounded-xl"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 sm:h-12 rounded-full text-sm sm:text-base active-press"
                  disabled={loading}
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-1.5 h-4 w-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {channels.map((c, i) => (
                <Reveal key={i} variant="right" delay={i * 100}>
                  <div className="flex items-start gap-3 sm:gap-4 bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5 hover-lift">
                    <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
                      {c.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5">
                        {c.title}
                      </h3>
                      {c.lines.map((line, j) => (
                        <p key={j} className="text-muted-foreground text-xs sm:text-sm">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}

              <div className="flex items-start gap-3 sm:gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 sm:p-5">
                <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5">
                    Business Hours
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Monday – Saturday: 9:00 AM – 6:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
