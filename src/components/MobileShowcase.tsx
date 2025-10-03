import { motion } from "framer-motion";
import mobileWelcome1 from "@/assets/mobile-welcome-1.jpeg";
import mobileWelcome2 from "@/assets/mobile-welcome-2.jpeg";
import mobileWelcome3 from "@/assets/mobile-welcome-3.jpeg";
import mobileDiscoverList from "@/assets/mobile-discover-list.jpeg";
import mobileDiscoverMap from "@/assets/mobile-discover-map.jpeg";
import mobileOrderReserve from "@/assets/mobile-order-reserve.jpeg";
import mobileExperiences from "@/assets/mobile-experiences.jpeg";
import mobileRewards from "@/assets/mobile-rewards.jpeg";
import { MapPin, Calendar, Gift, Sparkles } from "lucide-react";

export const MobileShowcase = () => {
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

  return (
    <div className="space-y-24 py-24">
      {/* Onboarding Section */}
      <section className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            Seamless Customer Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From discovery to rewards, every step designed for the perfect dining experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { image: mobileWelcome1, title: "Discover", delay: 0 },
            { image: mobileWelcome2, title: "Order", delay: 0.2 },
            { image: mobileWelcome3, title: "Rewards", delay: 0.4 },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.delay, duration: 0.6 }}
              className="relative group"
            >
              <div className="relative rounded-3xl overflow-hidden border-2 border-border glow-border group-hover:scale-105 transition-transform duration-300">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
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
