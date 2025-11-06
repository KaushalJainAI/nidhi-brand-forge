import { Card } from "@/components/ui/card";

const VideoStorySection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Video Section */}
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1596040033229-a0b551b7e6c3?w=800&q=80"
            >
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-spices-and-vegetables-on-a-wooden-table-26131-large.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Authentic Indian Flavors
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the rich heritage of traditional Indian spices, carefully sourced and blended to perfection. Each product tells a story of generations of expertise and passion for authentic flavors.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoStorySection;
