import { motion } from "framer-motion";
import { ExternalLink, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  selectedView: "mobile" | "web" | null;
}

export const CTASection = ({ selectedView }: CTASectionProps) => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {selectedView === "web" ? (
            <>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 glow-text">
                Ready to Transform Your Food Business?
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Join the TAMU platform and bring your culinary vision to life with our powerful business management tools
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.a
                  href="https://tamu-business.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30"
                  >
                    Launch Business Portal
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </motion.a>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-12 grid md:grid-cols-3 gap-6 text-left"
              >
                {[
                  { title: "Order Management", desc: "Track and manage all orders in real-time" },
                  { title: "Analytics Dashboard", desc: "Gain insights into your business performance" },
                  { title: "Customer Engagement", desc: "Build loyalty and grow your customer base" }
                ].map((feature, i) => (
                  <div key={i} className="p-6 rounded-xl glass-effect border border-border/50">
                    <h3 className="font-bold text-lg mb-2 text-primary">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
            </>
          ) : selectedView === "mobile" ? (
            <>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 glow-text">
                Download the TAMU App Today
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Experience the best of African cuisine at your fingertips. Discover, order, and earn rewards!
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30"
                  >
                    <Apple className="mr-2 w-6 h-6" />
                    App Store
                  </Button>
                </motion.a>

                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-primary bg-background/50 text-foreground hover:bg-primary/10 font-semibold rounded-xl"
                  >
                    <Smartphone className="mr-2 w-6 h-6" />
                    Google Play
                  </Button>
                </motion.a>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-12 grid md:grid-cols-3 gap-6 text-left"
              >
                {[
                  { title: "Discover Restaurants", desc: "Find authentic African dining experiences nearby" },
                  { title: "Easy Ordering", desc: "Order food for pickup or delivery with ease" },
                  { title: "Earn Rewards", desc: "Get rewarded for every purchase you make" }
                ].map((feature, i) => (
                  <div key={i} className="p-6 rounded-xl glass-effect border border-border/50">
                    <h3 className="font-bold text-lg mb-2 text-primary">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-8 text-sm text-muted-foreground"
              >
                Coming soon to iOS and Android
              </motion.p>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 glow-text">
                Join the TAMU Platform
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Choose your experience and start your journey with TAMU today
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.a
                  href="https://tamu-business.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30"
                  >
                    Business Portal
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </motion.a>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-primary bg-background/50 text-foreground hover:bg-primary/10 font-semibold rounded-xl"
                  >
                    <Smartphone className="mr-2 w-5 h-5" />
                    Mobile App
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};
