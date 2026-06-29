import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { API_BASE_URL, publicFetch } from "@/lib/api/config";

interface PolicyResponse {
  type: string;
  content: string | null;
}

const PrivacyPolicy = () => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicFetch<PolicyResponse>(`${API_BASE_URL}/policies/privacy/`)
      .then((data) => setContent(data?.content ?? null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading…</p>
          ) : content ? (
            <div className="prose prose-lg max-w-none whitespace-pre-line text-muted-foreground">
              {content}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Our privacy policy is being updated. Please check back soon or
              contact us for any privacy questions.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
