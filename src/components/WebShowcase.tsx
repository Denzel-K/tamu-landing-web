import { motion } from "framer-motion";
import businessDashboard from "@/assets/business-dashboard.png";
import businessLogin from "@/assets/business-login.png";
import { LayoutDashboard, ShoppingBag, Calendar, Users, BarChart3, Settings } from "lucide-react";

export const WebShowcase = () => {
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

        {/* Main Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" />
            <div className="relative rounded-2xl overflow-hidden border-2 border-border glow-border">
              <img
                src={businessDashboard}
                alt="Business Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl glass-effect border border-border hover:border-primary transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
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
