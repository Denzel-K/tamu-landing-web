"use client"

import { motion } from "framer-motion"
import { Smartphone, Monitor, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExperienceSwitcherProps {
  currentView: "mobile" | "web" | null
  onSwitch: (view: "mobile" | "web") => void
}

export const ExperienceSwitcher = ({ currentView, onSwitch }: ExperienceSwitcherProps) => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" /> */}

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 glow-text">Explore Both Experiences</h2>
          <p className="text-lg text-muted-foreground mb-12">
            {currentView === "web"
              ? "See how customers discover and order from your business"
              : "Discover the powerful tools available for business owners"}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer App Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              className={`p-8 rounded-2xl glass-effect border-2 transition-all duration-300 ${
                currentView === "mobile" ? "border-primary bg-primary/5" : "border-border hover:border-primary"
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Customer App</h3>
              <p className="text-muted-foreground mb-6">Discover, order, and experience local African cuisine</p>
              {currentView !== "mobile" && (
                <Button
                  onClick={() => onSwitch("mobile")}
                  variant="outline"
                  className="w-full border-primary hover:bg-primary/10"
                >
                  View Customer Experience
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {currentView === "mobile" && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                  Currently Viewing
                </div>
              )}
            </motion.div>

            {/* Business Portal Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              className={`p-8 rounded-2xl glass-effect border-2 transition-all duration-300 ${
                currentView === "web" ? "border-primary bg-primary/5" : "border-border hover:border-primary"
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Business Portal</h3>
              <p className="text-muted-foreground mb-6">Manage operations, orders, and grow your business</p>
              {currentView !== "web" && (
                <Button
                  onClick={() => onSwitch("web")}
                  variant="outline"
                  className="w-full border-primary hover:bg-primary/10"
                >
                  View Business Experience
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {currentView === "web" && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                  Currently Viewing
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
