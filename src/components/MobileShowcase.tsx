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
import { MapPin, Calendar, Gift, Sparkles, Search, Bell, Clock, Smartphone } from "lucide-react";

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
            <div className="space-y-4">
              {appBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-background to-background/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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

      {/* Features Section */}
      {features.map((feature, index) => {
        const isEven = index % 2 === 0;
        return (
          <section key={index} className="container mx-auto px-6">
            <div className={`grid md:grid-cols-2 gap-12 items-center ${!isEven ? "md:flex-row-reverse" : ""}`}>
              <motion.div
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={isEven ? "" : "md:order-2"}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={isEven ? "" : "md:order-1"}
              >
                <div className="relative max-w-xs mx-auto">
                  <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative rounded-3xl overflow-hidden border-2 border-border glow-border">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
