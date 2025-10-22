import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserX, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Mail, 
  Shield,
  Info,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { fetchMe, isAuthenticated } from "@/lib/api/auth";
import { authLocal, StoredUser } from "@/lib/auth/authLocal";
import { useToast } from "@/hooks/use-toast";

export const AccountDeletionSection = () => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deletionStep, setDeletionStep] = useState<'info' | 'auth' | 'form' | 'confirmation'>('info');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    reason: '',
    confirmations: {
      dataLoss: false,
      permanent: false,
      alternatives: false
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const authenticated = await isAuthenticated();
      setIsAuthenticatedUser(authenticated);
      
      if (authenticated) {
        const userData = authLocal.getUser();
        setUser(userData);
        setFormData(prev => ({ ...prev, email: userData?.email || '' }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // In a real implementation, this would call your sign-in API
      // For now, we'll simulate the process
      toast({
        title: "Sign In Required",
        description: "Please sign in through the main TAMU app to proceed with account deletion.",
        variant: "default"
      });
      
      // Redirect to main app sign-in
      const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
      const webBase = env.VITE_WEB_APP_BASE || "https://tamu-web-app.example.com";
      window.open(`${webBase}/auth/signin`, '_blank');
      
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "There was an error signing you in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.confirmations.dataLoss || !formData.confirmations.permanent || !formData.confirmations.alternatives) {
      toast({
        title: "Confirmations Required",
        description: "Please confirm all checkboxes to proceed with account deletion.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // In a real implementation, this would call your account deletion API
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeletionStep('confirmation');
      
      toast({
        title: "Deletion Request Submitted",
        description: "Your account deletion request has been submitted and will be processed within 30 days.",
        variant: "default"
      });
      
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "There was an error submitting your deletion request. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const proceedToDeletion = () => {
    if (isAuthenticatedUser) {
      setDeletionStep('form');
    } else {
      setDeletionStep('auth');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserX className="h-5 w-5" />
          Account Deletion
        </CardTitle>
        <CardDescription>
          Request permanent deletion of your TAMU account and associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {deletionStep === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Understanding Your Right */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Understanding Your Right to Data Deletion
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Under various data protection regulations, you have the right to request the deletion of your personal information from our systems. This right, often referred to as the "right to be forgotten," empowers you to have greater control over your digital footprint.
              </p>
              <p className="text-sm text-muted-foreground">
                When you request data deletion, we aim to remove all personally identifiable information associated with your account from our active systems. This includes your profile details, order history (where legally permissible), communication preferences, and any other personal data we've collected.
              </p>
            </div>

            <Separator />

            {/* Process Overview */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                How the Process Works
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium text-sm">Request Submission</p>
                      <p className="text-xs text-muted-foreground">Submit your deletion request through this form</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium text-sm">Verification Process</p>
                      <p className="text-xs text-muted-foreground">We verify your identity to protect your privacy</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium text-sm">Processing Timeline</p>
                      <p className="text-xs text-muted-foreground">Complete processing within 30 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">4</div>
                    <div>
                      <p className="font-medium text-sm">Confirmation</p>
                      <p className="text-xs text-muted-foreground">Receive confirmation of completed deletion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* What Gets Deleted */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  What Data Can Be Deleted
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                    <span>Account profile information (name, contact details, preferences)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                    <span>Order history and food preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                    <span>Communication history and reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                    <span>Usage data and activity logs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                    <span>Device information and location data</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  What Data We May Retain
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-1 flex-shrink-0" />
                    <span>Financial transaction records (tax and accounting purposes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-1 flex-shrink-0" />
                    <span>Information for fraud prevention and security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-1 flex-shrink-0" />
                    <span>Data required for legal compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-1 flex-shrink-0" />
                    <span>Information related to active disputes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-1 flex-shrink-0" />
                    <span>Anonymized data for analytics (non-identifiable)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Important Warnings */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Account deletion is permanent and cannot be reversed. You will lose access to your TAMU account, order history, saved preferences, and any benefits tied to account longevity. If you're uncertain, consider contacting our support team to discuss alternatives such as temporarily deactivating your account.
              </AlertDescription>
            </Alert>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={proceedToDeletion}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Proceed with Account Deletion
              </Button>
            </div>
          </motion.div>
        )}

        {deletionStep === 'auth' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                To proceed with account deletion, you need to sign in to verify your identity and ensure the security of your request.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sign In Required</CardTitle>
                <CardDescription>
                  Please sign in to your TAMU account to proceed with the deletion request.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeletionStep('info')}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {deletionStep === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {user && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Signed in as {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">{user.email}</p>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Deletion Request</CardTitle>
                <CardDescription>
                  Please provide the following information to complete your deletion request.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeletionRequest} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Deletion (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Help us improve by sharing why you're deleting your account..."
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Required Confirmations</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="dataLoss"
                          checked={formData.confirmations.dataLoss}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              confirmations: { ...prev.confirmations, dataLoss: !!checked }
                            }))
                          }
                        />
                        <Label htmlFor="dataLoss" className="text-sm leading-5">
                          I understand that deleting my account will permanently remove all my data, including order history, saved preferences, and account benefits.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="permanent"
                          checked={formData.confirmations.permanent}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              confirmations: { ...prev.confirmations, permanent: !!checked }
                            }))
                          }
                        />
                        <Label htmlFor="permanent" className="text-sm leading-5">
                          I understand that this action is permanent and cannot be reversed. I will need to create a new account if I want to use TAMU services again.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="alternatives"
                          checked={formData.confirmations.alternatives}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              confirmations: { ...prev.confirmations, alternatives: !!checked }
                            }))
                          }
                        />
                        <Label htmlFor="alternatives" className="text-sm leading-5">
                          I have considered alternatives such as temporarily deactivating my account or adjusting privacy settings, and I still want to proceed with permanent deletion.
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Your deletion request will be processed within 30 days. You will receive a confirmation email once the process is complete.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeletionStep(isAuthenticatedUser ? 'info' : 'auth')}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="destructive"
                      disabled={submitting || !formData.confirmations.dataLoss || !formData.confirmations.permanent || !formData.confirmations.alternatives}
                    >
                      {submitting ? "Submitting Request..." : "Submit Deletion Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {deletionStep === 'confirmation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Deletion Request Submitted</h3>
              <p className="text-muted-foreground mb-6">
                Your account deletion request has been successfully submitted and will be processed within 30 days.
              </p>
              
              <div className="bg-muted p-4 rounded-lg text-left max-w-md mx-auto">
                <h4 className="font-semibold mb-2">What happens next:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• You'll receive a confirmation email within 24 hours</li>
                  <li>• Our team will verify your identity and process the request</li>
                  <li>• Account deletion will be completed within 30 days</li>
                  <li>• You'll receive a final confirmation when deletion is complete</li>
                </ul>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" asChild>
                  <a href="mailto:privacy@tamu.app">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
