"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Apple, Smartphone, ArrowLeftRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApkDownloadModal } from "@/components/ApkDownloadModal"
import { TamuLogo } from "@/components/TamuLogo"
import appConfig from "@/config/app-config.json"

interface HeaderProps {
  selectedView: "mobile" | "web" | null
  onSwitchExperience: () => void
}

export const Header = ({ selectedView, onSwitchExperience }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false)
  const [isApkModalOpen, setIsApkModalOpen] = useState(false)

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
            <div className="flex items-center -ml-4">
              <TamuLogo size="md" />
              <span className="text-lg -ml-2 sm:text-2xl font-bold text-primary">TAMU</span>
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
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-[6px]">
                    <span className="hidden sm:inline">Launch Business Dashboard</span>
                    <span className="sm:hidden text-xs">Launch Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </motion.a>
              ) : (
                <div className="flex items-center gap-2">
                  {appConfig.isOfficial ? (
                    <>
                      <motion.a href={appConfig.appleStoreLink || "#"} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={!appConfig.appleStoreLink}
                        >
                          <Apple className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">App Store</span>
                        </Button>
                      </motion.a>
                      <motion.a href={appConfig.playStoreLink || "#"} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!appConfig.playStoreLink}>
                          <Smartphone className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Play Store</span>
                        </Button>
                      </motion.a>
                    </>
                  ) : (
                    <motion.button onClick={() => setIsApkModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!appConfig.apkLink}>
                        <Download className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Download APK</span>
                      </Button>
                    </motion.button>
                  )}
                </div>
              )}

              {/* Switch Experience Button */}
              <motion.button onClick={onSwitchExperience} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" variant="ghost" className="border border-border hover:border-primary px-[6px] sm:px[10px]">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {selectedView === "web" ? "Switch to Customer Experience" : "Switch to Business Experience"}
                  </span>
                  <span className="md:hidden text-xs">Switch</span>
                </Button>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>
      
      {/* APK Download Modal */}
      <ApkDownloadModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />
    </AnimatePresence>
  )
}
