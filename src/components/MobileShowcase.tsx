import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import mobileWelcome1 from "@/assets/mobile-welcome-1.jpeg";
import mobileWelcome2 from "@/assets/mobile-welcome-2.jpeg";
import mobileWelcome3 from "@/assets/mobile-welcome-3.jpeg";
import mobileDiscoverList from "@/assets/mobile-discover-list.jpeg";
import mobileDiscoverMap from "@/assets/mobile-discover-map.jpeg";
import mobileOrderReserve from "@/assets/mobile-order-reserve.jpeg";
import mobileExperiences from "@/assets/mobile-experiences.jpeg";
import mobileRewards from "@/assets/mobile-rewards.jpeg";
import intuitiveUi from "@/assets/intuitive-ui.jpeg";
import leaveReviews from "@/assets/leave-reviews.jpeg";
import { MapPin, Calendar, Gift, Sparkles, Search, Bell, Clock, Smartphone, Star, Palette } from "lucide-react";

export const MobileShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const welcomeImages = [
    { image: mobileWelcome1, title: "Discover" },
    { image: mobileWelcome2, title: "Order" },
    { image: mobileWelcome3, title: "Rewards" },
  ];

  const appBenefits = [
    {
      icon: Search,
      title: "Restaurant Discovery",
      description: "Find the best local restaurants with geo-tagged menus and smart filters",
    },
    {
      icon: Clock,
      title: "Real-time Order Tracking",
      description: "Track your orders in real-time from preparation to delivery",
    },
    {
      icon: Calendar,
      title: "Easy Reservations",
      description: "Book tables instantly and manage your dining schedule effortlessly",
    },
    {
      icon: Smartphone,
      title: "Everything in One Place",
      description: "Orders, reservations, rewards, and experiences—all in a single app",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Discover Local Food",
      description: "Explore geo-tagged menus and find the best restaurants around you with map and list views",
      image: mobileDiscoverList,
    },
    {
      icon: Calendar,
      title: "Order & Reserve",
      description: "Place orders for dine-in, takeaway, or delivery. Reserve tables with ease—all in one app",
      image: mobileOrderReserve,
    },
    {
      icon: Sparkles,
      title: "Unique Experiences",
      description: "Book culinary experiences like mixology classes and exclusive dining events",
      image: mobileExperiences,
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Track loyalty rewards and get notified via WhatsApp. Enjoy exclusive offers!",
      image: mobileRewards,
    },
    {
      icon: Palette,
      title: "Intuitive UI",
      description: "Navigate effortlessly with our beautifully designed, user-friendly interface",
      image: intuitiveUi,
    },
    {
      icon: Star,
      title: "Leave Reviews",
      description: "Share your dining experiences and help others discover great restaurants",
      image: leaveReviews,
    },
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % welcomeImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-24 py-24">
      {/* Hero Section with Slideshow and Benefits */}
      <section className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Seamless Customer Journey
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From discovery to rewards, every step designed for the perfect dining experience
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto items-center">
          {/* Slideshow - Left on desktop, Top on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative max-w-sm mx-auto">
              {/* Decorative background */}
              <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full" />
              
              {/* Slideshow container */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={welcomeImages[currentSlide].image}
                    alt={welcomeImages[currentSlide].title}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.7 }}
                    className="w-full h-auto"
                  />
                </AnimatePresence>
                
                {/* Slide indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {welcomeImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? "bg-primary w-8" 
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section - Right on desktop, Bottom on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-center lg:text-left mb-6">
              Why TAMU?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-background to-background/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 overflow-hidden"
                >
                  {/* Unique SVG Pattern Background for each card */}
                  <svg className="absolute inset-0 w-full h-full opacity-5 group-hover:opacity-10 transition-opacity" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      {index === 0 && (
                        <pattern id="benefit-pattern-0" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                          <circle cx="30" cy="30" r="3" fill="currentColor" className="text-primary" />
                          <circle cx="10" cy="10" r="2" fill="currentColor" className="text-primary" opacity="0.5" />
                          <circle cx="50" cy="50" r="2" fill="currentColor" className="text-primary" opacity="0.5" />
                        </pattern>
                      )}
                      {index === 1 && (
                        <pattern id="benefit-pattern-1" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 0 25 Q 12.5 15, 25 25 T 50 25" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" opacity="0.3" />
                          <path d="M 0 0 L 50 50 M 50 0 L 0 50" stroke="currentColor" strokeWidth="0.5" className="text-primary" opacity="0.2" />
                        </pattern>
                      )}
                      {index === 2 && (
                        <pattern id="benefit-pattern-2" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <rect x="18" y="18" width="4" height="4" fill="currentColor" className="text-primary" />
                          <circle cx="10" cy="30" r="1.5" fill="currentColor" className="text-primary" opacity="0.6" />
                          <circle cx="30" cy="10" r="1.5" fill="currentColor" className="text-primary" opacity="0.6" />
                        </pattern>
                      )}
                      {index === 3 && (
                        <pattern id="benefit-pattern-3" x="0" y="0" width="45" height="45" patternUnits="userSpaceOnUse">
                          <polygon points="22.5,5 27.5,20 22.5,20" fill="currentColor" className="text-primary" opacity="0.3" />
                          <circle cx="10" cy="35" r="2" fill="currentColor" className="text-primary" opacity="0.4" />
                          <circle cx="35" cy="10" r="2" fill="currentColor" className="text-primary" opacity="0.4" />
                        </pattern>
                      )}
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#benefit-pattern-${index})`} />
                  </svg>

                  <div className="relative flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold mb-1 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Horizontal Scroll (Google Play Store style) */}
      <section className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3">
            Explore Key Features
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto">
            Swipe to discover all the amazing features of the TAMU customer app
          </p>
        </motion.div>

        {/* Horizontal scrollable container */}
        <div className="relative">
          {/* Scroll container */}
          <div className="overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            <div className="flex gap-4 sm:gap-6 px-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex-shrink-0 w-64 sm:w-72 md:w-80 snap-center"
                >
                  {/* Screenshot card */}
                  <div className="group relative rounded-2xl sm:rounded-3xl border-2 border-border hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-background/50 shadow-lg hover:shadow-xl hover:shadow-primary/10">
                    {/* Image container */}
                    <div className="relative aspect-[9/16] rounded-t-xl sm:rounded-t-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="absolute -inset-2 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Description at bottom */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          <feature.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {feature.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scroll hint indicators (optional - shows on desktop) */}
          <div className="hidden md:flex justify-center gap-2 mt-6">
            {features.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-primary/30"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
