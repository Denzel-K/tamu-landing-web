"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Hero } from "@/components/Hero"
import { Header } from "@/components/Header"
import { ExperienceSwitcher } from "@/components/ExperienceSwitcher"
import { MobileShowcase } from "@/components/MobileShowcase"
import { WebShowcase } from "@/components/WebShowcase"
import { CTASection } from "@/components/CTASection"
import { TamuLogo } from "@/components/TamuLogo"

const Index = () => {
  const [selectedView, setSelectedView] = useState<"mobile" | "web" | null>(null)
  const [scrollEnabled, setScrollEnabled] = useState(false)
  const previousViewRef = useRef<"mobile" | "web" | null>(null)

  useEffect(() => {
    // Enable scroll always - Hero is now scrollable in default state
    document.body.style.overflow = "auto"
    
    if (selectedView) {
      // Small delay before enabling content scroll for smooth transition
      setTimeout(() => {
        setScrollEnabled(true)
      }, 800)
    } else {
      setScrollEnabled(false)
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [selectedView])

  useEffect(() => {
    const previous = previousViewRef.current
    if (previous && selectedView && previous !== selectedView) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    previousViewRef.current = selectedView
  }, [selectedView])

  const handleSelectView = (view: "mobile" | "web") => {
    setSelectedView(view)
  }

  const handleSwitchExperience = (nextView?: "mobile" | "web") => {
    const resolved =
      nextView ??
      (selectedView
        ? selectedView === "web"
          ? "mobile"
          : "web"
        : "mobile")
    setSelectedView(resolved)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header selectedView={selectedView} onSwitchExperience={() => handleSwitchExperience()} />

      {/* Hero Section */}
      <Hero onSelectView={handleSelectView} selectedView={selectedView} />

      {/* Content Sections - Only show after selection */}
      <AnimatePresence>
        {selectedView && scrollEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {selectedView === "mobile" ? <MobileShowcase /> : <WebShowcase />}

            <CTASection selectedView={selectedView} />

            <ExperienceSwitcher currentView={selectedView} onSwitch={(view) => handleSwitchExperience(view)} />

            {/* Footer */}
            <footer className="relative border-t border-border py-16 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />

              <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                  {/* Brand */}
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-4 -ml-4">
                      <TamuLogo size="md" />
                      <span className="text-2xl sm:text-3xl font-bold text-primary -ml-2">TAMU</span>
                    </div>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      Empowering African food businesses and connecting communities through innovative digital
                      solutions.
                    </p>
                    <div className="flex gap-4">
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full glass-effect border border-border/50 flex items-center justify-center hover:border-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full glass-effect border border-border/50 flex items-center justify-center hover:border-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full glass-effect border border-border/50 flex items-center justify-center hover:border-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Links */}
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-foreground">Platform</h3>
                    <ul className="space-y-3">
                      <li>
                        <button
                          onClick={() => handleSwitchExperience()}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Customer App
                        </button>
                      </li>
                      <li>
                        <a
                          href="https://tamu-business.onrender.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Business Portal
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          Features
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          Pricing
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Support */}
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-foreground">Support</h3>
                    <ul className="space-y-3">
                      <li>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          Help Center
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          Contact Us
                        </a>
                      </li>
                      <li>
                        <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                          Privacy Policy
                        </a>
                      </li>
                      <li>
                        <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                          Terms of Service
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-muted-foreground">© 2025 TAMU Platform. All rights reserved.</p>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <a href="/privacy" className="hover:text-primary transition-colors">
                      Privacy
                    </a>
                    <a href="/terms" className="hover:text-primary transition-colors">
                      Terms
                    </a>
                    <a href="#" className="hover:text-primary transition-colors">
                      Cookies
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Index
