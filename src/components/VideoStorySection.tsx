import spicesVideo from "@/assets/grok-video-2e290515-947f-4dd0-baca-4581ae53774a (1).mp4";

const VideoStorySection = () => {
  return (
    <section className="py-8 sm:py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-center">
          {/* Video Section */}
          <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-border">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src={spicesVideo}
            />
          </div>

          {/* Content Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Authentic Indian Flavors
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
              Experience the rich heritage of traditional Indian spices, carefully sourced and blended to perfection. Each product tells a story of generations of expertise and passion for authentic flavors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoStorySection;
