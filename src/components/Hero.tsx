import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, Monitor, Pizza, Beef, Donut, UtensilsCrossed, Soup, CookingPot, MapPin, ShoppingBag, Sparkles, BarChart3, Users, Settings } from "lucide-react"
import { TamuLogo } from "@/components/TamuLogo"
import restaurantStaff from "@/assets/restaurant-staff.png"
import restaurantCustomers from "@/assets/restaurant-customers.png"

interface HeroProps {
  onSelectView: (view: "mobile" | "web") => void
  selectedView: "mobile" | "web" | null
}

// Food icons for animated background
const foodIcons = [Pizza, Beef, Donut, UtensilsCrossed, Soup, CookingPot]

// Generate random icon column
const IconColumn = ({ delay, icons }: { delay: number; icons: typeof foodIcons }) => {
  return (
    <motion.div
      className="flex flex-col gap-12 opacity-10"
      initial={{ y: 0 }}
      animate={{ y: [0, -2000] }}
      transition={{
        duration: 40,
        repeat: Infinity,
        ease: "linear",
        delay: delay,
      }}
    >
      {icons.map((Icon, idx) => (
        <Icon key={idx} className="w-8 h-8 text-primary" strokeWidth={1.5} />
      ))}
    </motion.div>
  )
}

export const Hero = ({ onSelectView, selectedView }: HeroProps) => {
  const heroImage = selectedView === "web" ? restaurantStaff : restaurantCustomers
  const heroTitle = selectedView === "web" ? "Empower Your Restaurant Business" : "Discover & Experience Local Cuisine"
  const heroDescription =
    selectedView === "web"
      ? "Streamline operations, manage orders, and grow your African food business with our powerful business portal"
      : "Find authentic African dining experiences, order food, and earn rewards at your favorite local restaurants"

  // Generate columns with random icons
  const generateColumns = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const shuffledIcons = [...foodIcons, ...foodIcons, ...foodIcons, ...foodIcons].sort(() => Math.random() - 0.5)
      return { id: i, icons: shuffledIcons, delay: i * 2 }
    })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center py-8 sm:py-12">
      {/* Animated Food Icon Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient overlay - reduced opacity to show patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/50 to-background/60 z-10" />
        
        {/* Icon columns - responsive */}
        <div className="absolute inset-0 flex justify-around items-start">
          {/* Mobile: 4 columns */}
          <div className="flex justify-around w-full md:hidden">
            {generateColumns(4).map((col) => (
              <IconColumn key={col.id} delay={col.delay} icons={col.icons} />
            ))}
          </div>
          
          {/* Tablet: 6 columns */}
          <div className="hidden md:flex lg:hidden justify-around w-full">
            {generateColumns(6).map((col) => (
              <IconColumn key={col.id} delay={col.delay} icons={col.icons} />
            ))}
          </div>
          
          {/* Desktop: 8 columns */}
          <div className="hidden lg:flex justify-around w-full">
            {generateColumns(8).map((col) => (
              <IconColumn key={col.id} delay={col.delay} icons={col.icons} />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-12">
        <AnimatePresence mode="wait">
          {!selectedView ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-6xl mx-auto"
            >
              {/* Logo and Brand */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6 sm:mb-8"
              >
                <TamuLogo size="xl" className="mx-auto" />
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  TAMU
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Digital Platform for African Cuisine
                </p>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium text-primary">"It pays to Eat & Experience"</p>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-sm sm:text-base text-foreground/70 mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
              >
                Connecting food lovers with local restaurants and empowering businesses to thrive
              </motion.p>

              {/* View Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-primary font-semibold">
                    Choose Your Experience
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
                  {/* Customer App Card */}
                  <motion.button
                    onClick={() => onSelectView("mobile")}
                    whileHover={{ scale: 1.02, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-background to-background/50 border-2 border-border hover:border-primary transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-primary/20"
                  >
                    {/* SVG Pattern Background */}
                    <svg className="absolute inset-0 w-full h-full opacity-5 group-hover:opacity-10 transition-opacity" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="customer-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <circle cx="20" cy="20" r="2" fill="currentColor" className="text-primary" />
                          <path d="M 0 20 Q 10 10, 20 20 T 40 20" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#customer-pattern)" />
                    </svg>

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Animated corner accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                    {/* Card Image */}
                    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                      <img
                        src={restaurantCustomers}
                        alt="Customer App"
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 p-[8px] sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:rotate-6">
                        <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                          Customer App
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                          Discover and enjoy local cuisine
                        </p>
                        
                        {/* Feature List */}
                        <ul className="hidden sm:block text-left space-y-1 sm:space-y-1.5 text-xs text-muted-foreground/80">
                          <li className="flex items-start gap-1.5">
                            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>Find nearby restaurants</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>Order & reserve tables</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>Earn rewards & perks</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.button>

                  {/* Business Portal Card */}
                  <motion.button
                    onClick={() => onSelectView("web")}
                    whileHover={{ scale: 1.02, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-background to-background/50 border-2 border-border hover:border-primary transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-primary/20"
                  >
                    {/* SVG Pattern Background */}
                    <svg className="absolute inset-0 w-full h-full opacity-5 group-hover:opacity-10 transition-opacity" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="business-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <rect x="18" y="18" width="4" height="4" fill="currentColor" className="text-primary" />
                          <path d="M 0 0 L 40 40 M 40 0 L 0 40" stroke="currentColor" strokeWidth="0.5" className="text-primary" opacity="0.3" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#business-pattern)" />
                    </svg>

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Animated corner accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                    {/* Card Image */}
                    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                      <img
                        src={restaurantStaff}
                        alt="Business Portal"
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 p-[8px] sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:rotate-6">
                        <Monitor className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                          Business Portal
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                          Manage and grow your business
                        </p>
                        
                        {/* Feature List */}
                        <ul className="hidden sm:block text-left space-y-1 sm:space-y-1.5 text-xs text-muted-foreground/80">
                          <li className="flex items-start gap-1.5">
                            <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>Analytics & insights</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>Customer management</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>Menu & order control</span>
                          </li>
                        </ul>
                      </div>
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
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="sm:text-left space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-2 py-[6px] sm:gap-3 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/30">
                    {selectedView === "web" ? (
                      <Monitor className="w-5 h-5 text-primary" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-primary" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-primary">
                      {selectedView === "web" ? "Business Portal" : "Customer App"}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    {heroTitle}
                  </h1>

                  <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                    {heroDescription}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/20">
                    <img
                      src={heroImage}
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
          className="absolute bottom-8 left-1/2 -translate-x-1/md:text-base2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-primary flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-2 bg-primary rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
