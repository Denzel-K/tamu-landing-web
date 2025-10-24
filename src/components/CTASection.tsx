import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { ExternalLink, Apple, Smartphone, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApkDownloadModal } from "@/components/ApkDownloadModal";
import appConfig from "@/config/app-config.json";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRScanner from "@/components/QRScanner";
import { useNavigate } from "react-router-dom";

interface CTASectionProps {
  selectedView: "mobile" | "web" | null;
}

export const CTASection = ({ selectedView }: CTASectionProps) => {
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isTryHereOpen, setIsTryHereOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const navigate = useNavigate();

  const handleQrDetected = useCallback((text: string) => {
    try {
      // Normalize and route to Restaurant page if possible
      const url = new URL(text, window.location.origin);
      // Match /r/:id or /restaurant/:id or /enter?rid=...
      const path = url.pathname;
      let id: string | null = null;
      const rMatch = path.match(/\/r\/([^/?#]+)/);
      const restaurantMatch = path.match(/\/restaurant\/([^/?#]+)/);
      if (rMatch && rMatch[1]) {
        id = decodeURIComponent(rMatch[1]);
      } else if (restaurantMatch && restaurantMatch[1]) {
        id = decodeURIComponent(restaurantMatch[1]);
      } else if (path.endsWith('/enter') || path.endsWith('/Enter')) {
        const rid = url.searchParams.get('rid');
        if (rid) id = rid;
      }
      if (id) {
        setIsTryHereOpen(false);
        navigate(`/restaurant/${encodeURIComponent(id)}`);
        return;
      }
      // As a fallback, if it looks like a full URL under our domain with /r?id in query
      const rid = url.searchParams.get('rid') || url.searchParams.get('id');
      if (rid) {
        setIsTryHereOpen(false);
        navigate(`/restaurant/${encodeURIComponent(rid)}`);
        return;
      }
      // If we can't parse, just navigate to discover and close.
      setIsTryHereOpen(false);
      navigate('/discover');
    } catch (err) {
      // Not a valid URL, attempt to parse simple patterns
      const simple = text.match(/(?:^|\/)r\/(\w+)/) || text.match(/(?:^|\/)restaurant\/(\w+)/);
      if (simple && simple[1]) {
        setIsTryHereOpen(false);
        navigate(`/restaurant/${encodeURIComponent(simple[1])}`);
        return;
      }
      setIsTryHereOpen(false);
      navigate('/discover');
    }
  }, [navigate]);

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
              <h2 className="text-3xl md:text-6xl font-bold mb-6 glow-text">
                Ready to Transform Your Food Business?
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground mb-12">
                Join the TAMU platform and bring your culinary vision to life with our powerful business management tools
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.a
                  href="https://tamu-business.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="text-sm sm:text-base px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30"
                  >
                    Launch Business Portal
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </motion.a>
              </div>
            </>
          ) : selectedView === "mobile" ? (
            <>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 glow-text">
                Download the TAMU App Today
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Experience the best of African cuisine at your fingertips. Discover, order, and earn rewards!
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {appConfig.isOfficial ? (
                  <>
                    <motion.a
                      href={appConfig.appleStoreLink || "#"}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block"
                    >
                      <Button
                        size="lg"
                        className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30"
                        disabled={!appConfig.appleStoreLink}
                      >
                        <Apple className="mr-2 w-6 h-6" />
                        App Store
                      </Button>
                    </motion.a>

                    <motion.a
                      href={appConfig.playStoreLink || "#"}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-6 border-2 border-primary bg-background/50 text-foreground hover:bg-primary/10 font-semibold rounded-xl"
                        disabled={!appConfig.playStoreLink}
                      >
                        <Smartphone className="mr-2 w-6 h-6" />
                        Google Play
                      </Button>
                    </motion.a>
                  </>
                ) : (
                  <motion.button
                    onClick={() => setIsApkModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      className="text-sm sm:text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30"
                      disabled={!appConfig.apkLink}
                    >
                      <Download className="mr-2 w-6 h-6" />
                      Download APK Build
                    </Button>
                  </motion.button>
                )}
                {/* In-restaurant mode CTA */}
                <motion.button
                  onClick={() => { setShowScanner(true); setIsTryHereOpen(true); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-sm sm:text-lg px-8 py-6 border-2 border-primary bg-background/50 text-foreground hover:bg-primary/10 font-semibold rounded-xl"
                  >
                    Try it right here
                  </Button>
                </motion.button>
              </div>

              {!appConfig.isOfficial && (
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mt-8 text-sm text-muted-foreground"
                >
                  Coming soon to iOS and Android
                </motion.p>
              )}
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
                  href="https://tamu-business.onrender.com"
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

      {/* APK Download Modal */}
      <ApkDownloadModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />

      {/* Try it here Modal */}
      <Dialog open={isTryHereOpen} onOpenChange={setIsTryHereOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Try TAMU in your browser</DialogTitle>
            <DialogDescription>
              Go straight to discovery or scan a QR code to enter in-restaurant mode.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => { setIsTryHereOpen(false); navigate('/discover'); }}>
                Explore nearby restaurants
              </Button>
              <Button variant="outline" onClick={() => setShowScanner((s) => !s)} className="inline-flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                {showScanner ? 'Hide scanner' : 'Scan QR to enter'}
              </Button>
            </div>
            {showScanner && (
              <div className="rounded-lg border p-3">
                <QRScanner onDetected={handleQrDetected} onCancel={() => setShowScanner(false)} />
                <div className="mt-2 text-xs text-muted-foreground">
                  Tip: Allow camera access to scan check‑in QR codes placed at the venue.
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
