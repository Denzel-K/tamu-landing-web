import { motion, AnimatePresence } from "framer-motion";
import { Download, AlertCircle, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import appConfig from "@/config/app-config.json";

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal = ({ isOpen, onClose }: ApkDownloadModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-gradient-to-br from-background to-background/95 border-2 border-primary/20 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden"
            >
              {/* Decorative background pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="apk-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="2" fill="currentColor" className="text-primary" />
                    <path d="M 0 20 Q 10 10, 20 20 T 40 20" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#apk-pattern)" />
              </svg>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/50 border border-border hover:border-primary flex items-center justify-center transition-all duration-200 hover:bg-primary/10 z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="relative p-6 sm:p-8 space-y-6">
                {/* Icon and Title */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Download APK Build
                  </h2>
                </div>

                {/* Info sections */}
                <div className="space-y-4">
                  {/* Welcome message */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Early Access Available</p>
                      <p className="text-xs text-muted-foreground">
                        Thank you for your interest in TAMU! We're excited to have you try our app.
                      </p>
                    </div>
                  </div>

                  {/* Caution message */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1 text-orange-500">Unofficial Release</p>
                      <p className="text-xs text-muted-foreground">
                        This is a development build for testing purposes. The official release on Google Play Store and Apple App Store is coming very soon!
                      </p>
                    </div>
                  </div>

                  {/* Installation note */}
                  <div className="p-4 rounded-xl bg-background/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Note:</span> You may need to enable "Install from Unknown Sources" in your Android settings to install this APK.
                    </p>
                  </div>
                </div>

                {/* Download button */}
                <div className="space-y-3">
                  <motion.a
                    href={appConfig.apkLink || "#"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block"
                  >
                    <Button
                      size="lg"
                      className="w-full text-base sm:text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30"
                      disabled={!appConfig.apkLink}
                    >
                      <Download className="mr-2 w-5 h-5" />
                      Download APK Now
                    </Button>
                  </motion.a>

                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Footer text */}
                <p className="text-center text-xs text-muted-foreground">
                  By downloading, you acknowledge this is a pre-release version
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
