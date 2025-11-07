import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your satisfaction is our priority
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Return Eligibility</h2>
                <p className="text-muted-foreground mb-4">
                  We accept returns within 7 days of delivery for the following reasons:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Product received is damaged or defective</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Wrong product delivered</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Product packaging is tampered or broken</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Missing items from your order</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Non-Returnable Items</h2>
                <p className="text-muted-foreground mb-4">
                  Due to hygiene and quality reasons, the following items cannot be returned:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Products with broken seals or opened packaging (unless damaged on arrival)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Products that have been used or consumed</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Return Process</h2>
                <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                  <li>Contact our customer support within 7 days of delivery</li>
                  <li>Provide order number and reason for return with photos</li>
                  <li>Our team will verify your request within 24-48 hours</li>
                  <li>Once approved, we'll arrange a pickup from your address</li>
                  <li>Product must be returned in original packaging</li>
                </ol>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Refund Process</h2>
                <p className="text-muted-foreground mb-4">
                  Once we receive and inspect the returned product:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Refunds are processed within 5-7 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Amount will be credited to the original payment method</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>You will receive an email confirmation once refund is processed</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Exchange Policy</h2>
                <p className="text-muted-foreground">
                  We offer product exchanges for damaged or defective items. The exchange product will be shipped at no additional cost once we receive the returned item.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Cancellation Policy</h2>
                <p className="text-muted-foreground mb-4">
                  Orders can be cancelled free of charge if:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Cancellation request is made within 24 hours of placing the order</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Order has not been shipped yet</span>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Once the order is shipped, cancellation is not possible. You may return the product as per our return policy.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  For any return or refund queries, please contact our customer support at +91 93029 22251 or email us through our contact page. Our team is available Monday to Saturday, 9 AM to 6 PM IST.
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

export default ReturnPolicy;
