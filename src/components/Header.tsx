"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Apple, Smartphone, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  selectedView: "mobile" | "web" | null
  onSwitchExperience: () => void
}

export const Header = ({ selectedView, onSwitchExperience }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!selectedView) return null

  return (
    <AnimatePresence>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.86-.93-6.5-4.56-6.5-8.5V8.31l6.5-3.25 6.5 3.25V12c0 3.94-2.64 7.57-6.5 8.5z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-primary">TAMU</span>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Experience-specific buttons */}
              {selectedView === "web" ? (
                <motion.a
                  href="https://tamu-business.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Launch Business Dashboard
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </motion.a>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/50 hover:bg-primary/10 bg-transparent"
                    >
                      <Apple className="mr-2 w-4 h-4" />
                      <span className="hidden sm:inline">App Store</span>
                    </Button>
                  </motion.a>
                  <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Smartphone className="mr-2 w-4 h-4" />
                      <span className="hidden sm:inline">Play Store</span>
                    </Button>
                  </motion.a>
                </div>
              )}

              {/* Switch Experience Button */}
              <motion.button onClick={onSwitchExperience} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" variant="ghost" className="border border-border hover:border-primary">
                  <ArrowLeftRight className="mr-2 w-4 h-4" />
                  <span className="hidden md:inline">
                    {selectedView === "web" ? "Switch to Customer Experience" : "Switch to Business Experience"}
                  </span>
                  <span className="md:hidden">Switch</span>
                </Button>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>
    </AnimatePresence>
  )
}
