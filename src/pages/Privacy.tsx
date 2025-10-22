import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TamuLogo } from "@/components/TamuLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  UserX, 
  Mail, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { AccountDeletionSection } from "@/components/privacy/AccountDeletionSection";

const Privacy = () => {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const sections = useMemo(() => [
    { id: "overview", title: "Overview", icon: Eye },
    { id: "data-collection", title: "Data Collection", icon: Database },
    { id: "data-usage", title: "How We Use Data", icon: Shield },
    { id: "data-sharing", title: "Data Sharing", icon: Lock },
    { id: "data-security", title: "Data Security", icon: Shield },
    { id: "your-rights", title: "Your Rights", icon: UserX },
    { id: "account-deletion", title: "Account Deletion", icon: UserX },
    { id: "contact", title: "Contact Us", icon: Mail },
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => 
        document.getElementById(section.id)
      );
      
      const currentSection = sectionElements.find(element => {
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <TamuLogo size="sm" />
            <div>
              <h1 className="text-lg font-semibold">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: October 2024</p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Shield className="h-3 w-3 mr-1" />
            GDPR Compliant
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Contents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <nav className="space-y-1 p-4">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                            activeSection === section.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {section.title}
                        </button>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Section */}
            <motion.section
              id="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Privacy Policy Overview
                  </CardTitle>
                  <CardDescription>
                    Your privacy is important to us. This policy explains how TAMU collects, uses, and protects your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Data Protection
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        We implement industry-standard security measures to protect your personal information.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <UserX className="h-4 w-4 text-blue-600" />
                        Your Rights
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        You have the right to access, modify, or delete your personal data at any time.
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Quick Summary:</strong> TAMU is a restaurant discovery and ordering platform. We collect information necessary to provide our services, including account details, order history, and preferences. We never sell your personal data to third parties.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Data Collection Section */}
            <motion.section
              id="data-collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Personal Information</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Account Details:</strong> Name, email address, phone number, and profile information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Order Information:</strong> Food preferences, delivery addresses, payment methods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Communication Data:</strong> Messages, reviews, and customer support interactions</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Technical Information</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Device Information:</strong> Device type, operating system, app version</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Usage Data:</strong> App interactions, feature usage, session duration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Location Data:</strong> GPS coordinates for delivery and restaurant discovery (with permission)</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Data Usage Section */}
            <motion.section
              id="data-usage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Service Delivery</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Process orders and reservations</li>
                        <li>• Facilitate payments and refunds</li>
                        <li>• Provide customer support</li>
                        <li>• Send order updates and notifications</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Personalization</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Recommend restaurants and dishes</li>
                        <li>• Customize your app experience</li>
                        <li>• Remember your preferences</li>
                        <li>• Show relevant promotions</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Security & Safety</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Prevent fraud and abuse</li>
                        <li>• Verify user identity</li>
                        <li>• Maintain platform security</li>
                        <li>• Comply with legal requirements</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Improvement</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Analyze app performance</li>
                        <li>• Develop new features</li>
                        <li>• Conduct research and analytics</li>
                        <li>• Optimize user experience</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Data Sharing Section */}
            <motion.section
              id="data-sharing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Information Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      We Never Sell Your Data
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      TAMU does not sell, rent, or trade your personal information to third parties for marketing purposes.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Limited Sharing for Service Delivery</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-sm">Restaurant Partners</p>
                          <p className="text-xs text-muted-foreground">Order details and delivery information to fulfill your orders</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-sm">Payment Processors</p>
                          <p className="text-xs text-muted-foreground">Payment information to process transactions securely</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-sm">Service Providers</p>
                          <p className="text-xs text-muted-foreground">Technical services, analytics, and customer support tools</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Data Security Section */}
            <motion.section
              id="data-security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-semibold text-sm">Encryption</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        All data is encrypted in transit and at rest using industry-standard protocols
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h4 className="font-semibold text-sm">Access Control</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Strict access controls and authentication for all systems and data
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-semibold text-sm">Monitoring</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Continuous monitoring and security audits to detect and prevent threats
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Your Rights Section */}
            <motion.section
              id="your-rights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="h-5 w-5" />
                    Your Privacy Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Access & Portability</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Request a copy of your personal data in a portable format
                      </p>
                      <Button variant="outline" size="sm">
                        Request Data Export
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Correction</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Update or correct inaccurate personal information
                      </p>
                      <Button variant="outline" size="sm">
                        Update Profile
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Opt-Out</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Control marketing communications and data processing
                      </p>
                      <Button variant="outline" size="sm">
                        Manage Preferences
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Deletion</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Request complete deletion of your account and data
                      </p>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Account Deletion Section */}
            <motion.section
              id="account-deletion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <AccountDeletionSection />
            </motion.section>

            {/* Contact Section */}
            <motion.section
              id="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Privacy Questions</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        For privacy-related inquiries and data requests
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="mailto:privacy@tamu.app" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          privacy@tamu.app
                        </a>
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">General Support</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        For general questions and technical support
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="mailto:support@tamu.app" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          support@tamu.app
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Response Time:</strong> We typically respond to privacy requests within 48 hours and complete data deletion requests within 30 days as required by applicable data protection laws.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <TamuLogo size="sm" />
              <div className="text-sm text-muted-foreground">
                <p>© 2024 TAMU. All rights reserved.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Button variant="link" size="sm" asChild>
                <a href="/terms">Terms of Service</a>
              </Button>
              <Button variant="link" size="sm" asChild>
                <a href="/privacy">Privacy Policy</a>
              </Button>
              <Button variant="link" size="sm" asChild>
                <a href="mailto:legal@tamu.app" className="flex items-center gap-1">
                  Legal <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
