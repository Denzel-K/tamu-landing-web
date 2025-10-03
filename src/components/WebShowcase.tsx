import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import businessDashboard from "@/assets/business-dashboard.png";
import businessLogin from "@/assets/business-login.png";
import menuManagement from "@/assets/menu-management.png";
import staffManagement from "@/assets/staff-management.png";
import { LayoutDashboard, ShoppingBag, Calendar, Users, BarChart3, Settings } from "lucide-react";

export const WebShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const managementScreens = [
    { image: businessDashboard, title: "Unified Dashboard", description: "Complete overview of your business" },
    { image: menuManagement, title: "Menu Management", description: "Easily manage your menu items and pricing" },
    { image: staffManagement, title: "Staff Management", description: "Organize and manage your team efficiently" },
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % managementScreens.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: LayoutDashboard,
      title: "Unified Dashboard",
      description: "Personalized shortcuts to Orders, Reservations, Experiences, Menu Manager, and more—all in one place",
    },
    {
      icon: ShoppingBag,
      title: "Real-time Order Processing",
      description: "Create and manage customer orders instantly with live tracking and status updates",
    },
    {
      icon: Calendar,
      title: "Smart Reservations",
      description: "Manage bookings and schedules efficiently with an intelligent calendar system",
    },
    {
      icon: Users,
      title: "Customer Relationship Management",
      description: "View customer profiles, history, and build lasting relationships with your patrons",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track performance metrics and gain valuable insights to grow your business",
    },
    {
      icon: Settings,
      title: "Complete Control",
      description: "Edit menu items, prices, categories, and manage every aspect of your digital presence",
    },
  ];

  return (
    <div className="space-y-24 py-24">
      {/* Hero Section */}
      <section className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            Complete Business Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage, grow, and thrive in today's digital market
          </p>
        </motion.div>

        {/* Main Dashboard Preview - Slideshow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" />
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <img
                    src={managementScreens[currentSlide].image}
                    alt={managementScreens[currentSlide].title}
                    className="w-full h-auto"
                  />
                  
                  {/* Slide caption overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 text-primary">
                      {managementScreens[currentSlide].title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {managementScreens[currentSlide].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Slide indicators */}
              <div className="absolute top-4 right-4 flex gap-2">
                {managementScreens.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? "bg-primary w-8" 
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + managementScreens.length) % managementScreens.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % managementScreens.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-all duration-300 group"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl glass-effect border border-border hover:border-primary transition-all duration-300"
            >
              {/* Title and Icon on same line */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-base sm:text-lg md:text-xl font-bold flex-1 line-clamp-2">{feature.title}</h3>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Login Section */}
      <section className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Secure & Simple Access
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Enterprise-grade security with multiple authentication options. 
              Sign in with email, or use Google, Facebook, or Apple for quick access.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground">
                  Digital menu management for street vendors to upscale restaurants
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground">
                  Real-time order processing and customer relationship tools
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground">
                  Comprehensive analytics and business insights
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-border glow-border">
                <img
                  src={businessLogin}
                  alt="Business Login"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
