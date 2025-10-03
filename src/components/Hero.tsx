"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, Monitor } from "lucide-react"
import restaurantStaff from "@/assets/restaurant-staff.png"
import restaurantCustomers from "@/assets/restaurant-customers.png"
import mobileWelcome1 from "@/assets/restaurant-customers.png"
import businessDashboard from "@/assets/restaurant-staff.png"

interface HeroProps {
  onSelectView: (view: "mobile" | "web") => void
  selectedView: "mobile" | "web" | null
}

export const Hero = ({ onSelectView, selectedView }: HeroProps) => {
  const heroImage = selectedView === "web" ? restaurantStaff : restaurantCustomers
  const heroTitle = selectedView === "web" ? "Empower Your Restaurant Business" : "Discover & Experience Local Cuisine"
  const heroDescription =
    selectedView === "web"
      ? "Streamline operations, manage orders, and grow your African food business with our powerful business portal"
      : "Find authentic African dining experiences, order food, and earn rewards at your favorite local restaurants"

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-y-auto">
      {/* Animated background layers */}
      <AnimatePresence mode="wait">
        {selectedView && (
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
            <img
              src={heroImage || "/placeholder.svg"}
              alt={selectedView === "web" ? "Restaurant Staff" : "Restaurant Customers"}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedView && (
        <>
          {/* Gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_60%)]" />

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </>
      )}

      <div className="container mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedView ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-5xl mx-auto"
            >
              {/* Logo and Brand */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-6">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary-foreground" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.86-.93-6.5-4.56-6.5-8.5V8.31l6.5-3.25 6.5 3.25V12c0 3.94-2.64 7.57-6.5 8.5z" />
                  </svg>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold mb-4 glow-text">TAMU</h1>
                <p className="text-xl md:text-2xl text-muted-foreground">Empowering African Food Businesses</p>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-foreground/80 mb-12 max-w-2xl mx-auto"
              >
                From street vendors to upscale restaurants, discover the digital platform transforming the African
                culinary landscape
              </motion.p>

              {/* View Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="space-y-6"
              >
                <p className="text-sm uppercase tracking-wider text-primary font-semibold">Choose Your Experience</p>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <motion.button
                    onClick={() => onSelectView("mobile")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-2xl glass-effect border-2 border-border hover:border-primary transition-all duration-300 glow-border"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Card Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={mobileWelcome1 || "/placeholder.svg"}
                        alt="Customer App"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 p-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Smartphone className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Customer App</h3>
                      <p className="text-muted-foreground">Discover, order, and experience local African cuisine</p>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => onSelectView("web")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-2xl glass-effect border-2 border-border hover:border-primary transition-all duration-300 glow-border"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Card Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={businessDashboard || "/placeholder.svg"}
                        alt="Business Portal"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 p-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Monitor className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Business Portal</h3>
                      <p className="text-muted-foreground">Manage operations, orders, and grow your business</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-left space-y-6"
                >
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-effect border border-primary/30">
                    {selectedView === "web" ? (
                      <Monitor className="w-5 h-5 text-primary" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-primary" />
                    )}
                    <span className="text-sm font-semibold text-primary">
                      {selectedView === "web" ? "Business Portal" : "Customer App"}
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-bold leading-tight glow-text">{heroTitle}</h1>

                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">{heroDescription}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden glow-border">
                    <img
                      src={heroImage || "/placeholder.svg"}
                      alt={selectedView === "web" ? "Restaurant Staff" : "Restaurant Customers"}
                      className="w-full h-auto rounded-3xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator - only show when view is selected */}
      {selectedView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-primary flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              className="w-1 h-2 bg-primary rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
