import Footer from "@/components/Footer";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Shipping Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our shipping process
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Shipping Areas</h2>
                <p className="text-muted-foreground">
                  We currently ship to all locations within India. Unfortunately, we do not ship internationally at this time.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Delivery Timeline</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Metro Cities:</strong> 3-5 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Other Cities:</strong> 5-7 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Remote Areas:</strong> 7-10 business days</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Shipping Charges</h2>
                <p className="text-muted-foreground mb-4">
                  Shipping charges are calculated based on the weight of your order and delivery location:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Orders above ₹500: <strong>Free Shipping</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Orders below ₹500: ₹40 shipping charges apply</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Order Tracking</h2>
                <p className="text-muted-foreground">
                  Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order using this number on our Track Order page or the courier partner's website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Order Processing</h2>
                <p className="text-muted-foreground">
                  Orders are processed within 24-48 hours of receiving payment confirmation. Orders placed on weekends or holidays will be processed on the next business day.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Delivery Attempts</h2>
                <p className="text-muted-foreground">
                  Our courier partner will make 3 delivery attempts. If all attempts fail, the order will be returned to us. Please ensure someone is available to receive the order at the provided address.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  For any shipping-related queries, please contact our customer support at +91 93029 22251 or email us through our contact page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;
