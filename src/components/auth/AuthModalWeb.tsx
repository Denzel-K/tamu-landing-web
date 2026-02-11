import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mobileAuthService, { type RegisterRequest, type LoginRequest } from "@/lib/auth/mobileAuthService";
import { authBus } from "@/lib/auth/authLocal";
import tamuLogo from "@/assets/tamu_logo.png";
import { Eye, EyeOff } from "lucide-react";

export type AuthView = "signin" | "signup" | "verify" | "forgot" | "reset";

interface AuthModalWebProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAuthed?: () => void; // called after a successful auth
  initialView?: AuthView;
}

export default function AuthModalWeb({ open, onOpenChange, onAuthed, initialView = "signup" }: AuthModalWebProps) {
  // Preserve state across open/close by not unmounting the component at parent level.
  const [view, setView] = useState<AuthView>(initialView);

  // Sign In
  const [siIdentifier, setSiIdentifier] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siPwVisible, setSiPwVisible] = useState(false);
  const [siLoading, setSiLoading] = useState(false);
  const [siError, setSiError] = useState<string | null>(null);

  // Sign Up
  const [su, setSu] = useState<RegisterRequest>({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [suCountryCode, setSuCountryCode] = useState("+254");
  const [suPwVisible, setSuPwVisible] = useState(false);
  const [suPw2Visible, setSuPw2Visible] = useState(false);
  const [suLoading, setSuLoading] = useState(false);
  const [suError, setSuError] = useState<string | null>(null);

  // Verify
  const [vEmail, setVEmail] = useState("");
  const [vOtp, setVOtp] = useState("");
  const [vLoading, setVLoading] = useState(false);
  const [vError, setVError] = useState<string | null>(null);

  // Forgot/Reset
  const [fEmail, setFEmail] = useState("");
  const [rOtp, setROtp] = useState("");
  const [rPass, setRPass] = useState("");
  const [rPass2, setRPass2] = useState("");
  const [rPwVisible, setRPwVisible] = useState(false);
  const [rPw2Visible, setRPw2Visible] = useState(false);
  const [frLoading, setFrLoading] = useState(false);
  const [frError, setFrError] = useState<string | null>(null);

  // Success state displayed after successful auth
  const [success, setSuccess] = useState<{ title: string; subtitle?: string } | null>(null);

  useEffect(() => {
    // After successful auth from anywhere, show success state and notify parent
    const unsub = authBus.subscribe('login', () => {
      setSuccess({ title: 'Signed in successfully!', subtitle: 'You can now continue to reservations or checkout.' });
      onAuthed?.();
      // Do not auto-close; let the user click Continue or parent close explicitly
    });
    return () => unsub();
  }, [onAuthed]);

  useEffect(() => {
    if (open && initialView) {
      setView(initialView);
    }
  }, [open, initialView]);

  const canSignin = useMemo(() => siIdentifier.trim().length > 3 && siPassword.length >= 6, [siIdentifier, siPassword]);
  const canSignup = useMemo(() => {
    return (
      su.firstName.trim().length > 0 &&
      su.lastName.trim().length > 0 &&
      /@/.test(su.email) &&
      su.password.length >= 6 &&
      su.password === su.confirmPassword
    );
  }, [su]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-4 mb-2">
            <img src={tamuLogo} alt="TAMU" className="h-16 w-16 -m-4 object-contain" />
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : view === 'verify' ? 'Verify Email' : view === 'forgot' ? 'Forgot Password' : 'Reset Password'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join TAMU to personalize your dining experience and save favorites.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">

          {success && (
            <div className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.52-1.66-1.66a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.156-.094l3.83-5.204Z" clipRule="evenodd" /></svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{success.title}</h3>
                {success.subtitle && <p className="text-sm text-muted-foreground">{success.subtitle}</p>}
              </div>
              <Button className="w-full" onClick={() => { setSuccess(null); onOpenChange(false); }}>Continue</Button>
            </div>
          )}

          {!success && view === 'signin' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {siError && (
                <div className="text-sm text-red-500 bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r-md">
                  {siError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="si-id" className="text-sm font-medium">Email or Phone</Label>
                <Input
                  id="si-id"
                  value={siIdentifier}
                  onChange={(e) => setSiIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-background/50 border-border focus:ring-primary/50 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-pw" className="text-sm font-medium">Password</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="si-pw"
                    type={siPwVisible ? 'text' : 'password'}
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-border focus:ring-primary/50 transition-all duration-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSiPwVisible(v => !v)}
                    className="shrink-0 hover:bg-primary/10 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {siPwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  className="w-full font-semibold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!canSignin || siLoading}
                  onClick={async () => {
                    setSiError(null); setSiLoading(true);
                    try {
                      const payload: LoginRequest = { emailOrPhone: siIdentifier, password: siPassword };
                      await mobileAuthService.login(payload);
                    } catch (e) { setSiError(e?.message || 'Sign in failed'); }
                    finally { setSiLoading(false); }
                  }}
                  aria-busy={siLoading}
                >
                  {siLoading ? 'Signing in…' : 'Sign In'}
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-muted-foreground">
                    No account? <button className="text-primary hover:underline font-medium transition-all" onClick={() => setView('signup')}>Create one</button>
                  </div>
                  <button className="text-muted-foreground hover:text-primary transition-colors" onClick={() => setView('forgot')}>Forgot password?</button>
                </div>
              </div>
            </div>
          )}

          {!success && view === 'signup' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {suError && (
                <div className="text-sm text-red-500 bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r-md">
                  {suError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="su-fn" className="text-sm font-medium">First name</Label>
                  <Input id="su-fn" className="bg-background/50 border-border focus:ring-primary/50 transition-all duration-200" value={su.firstName} onChange={(e) => setSu({ ...su, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-ln" className="text-sm font-medium">Last name</Label>
                  <Input id="su-ln" className="bg-background/50 border-border focus:ring-primary/50 transition-all duration-200" value={su.lastName} onChange={(e) => setSu({ ...su, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-email" className="text-sm font-medium">Email</Label>
                <Input id="su-email" type="email" className="bg-background/50 border-border focus:ring-primary/50 transition-all duration-200" value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-phone" className="text-sm font-medium">Phone</Label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    id="su-phone-code"
                    className="col-span-1 h-10 rounded-md border border-input bg-background/50 px-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-200"
                    value={suCountryCode}
                    onChange={(e) => setSuCountryCode(e.target.value)}
                  >
                    {['+254', '+1', '+44', '+61', '+81', '+82', '+86', '+31', '+33', '+34', '+39', '+49', '+55', '+52', '+971', '+966', '+27', '+256', '+255', '+250', '+211', '+212', '+213', '+216'].map(cc => (
                      <option key={cc} value={cc}>{cc}</option>
                    ))}
                  </select>
                  <Input
                    id="su-phone"
                    className="col-span-3 bg-background/50 border-border focus:ring-primary/50 transition-all duration-200"
                    value={su.phone || ''}
                    onChange={(e) => setSu({ ...su, phone: e.target.value })}
                    placeholder="712345678"
                    inputMode="tel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-pw" className="text-sm font-medium">Password</Label>
                <div className="flex gap-2 items-center">
                  <Input id="su-pw" type={suPwVisible ? 'text' : 'password'} className="bg-background/50 border-border focus:ring-primary/50 transition-all duration-200" value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} />
                  <Button type="button" variant="outline" size="icon" className="shrink-0 hover:bg-primary/10 transition-colors" onClick={() => setSuPwVisible(v => !v)} aria-label="Toggle password visibility">
                    {suPwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-pw2" className="text-sm font-medium">Confirm</Label>
                <div className="flex gap-2 items-center">
                  <Input id="su-pw2" type={suPw2Visible ? 'text' : 'password'} className="bg-background/50 border-border focus:ring-primary/50 transition-all duration-200" value={su.confirmPassword} onChange={(e) => setSu({ ...su, confirmPassword: e.target.value })} />
                  <Button type="button" variant="outline" size="icon" className="shrink-0 hover:bg-primary/10 transition-colors" onClick={() => setSuPw2Visible(v => !v)} aria-label="Toggle password visibility">
                    {suPw2Visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  className="w-full font-semibold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!canSignup || suLoading}
                  onClick={async () => {
                    setSuError(null); setSuLoading(true);
                    try {
                      const digits = (su.phone || '').replace(/[^0-9]/g, '');
                      const payload = { ...su, phone: digits ? `${suCountryCode}${digits}` : undefined } as RegisterRequest;
                      const resp = await mobileAuthService.register(payload);
                      if (resp?.success) setView('verify');
                    } catch (e) { setSuError(e?.message || 'Sign up failed'); }
                    finally { setSuLoading(false); }
                  }}
                  aria-busy={suLoading}
                >
                  {suLoading ? 'Creating…' : 'Create Account'}
                </Button>
                <div className="text-center text-xs text-muted-foreground">
                  Already have an account? <button className="text-primary hover:underline font-medium transition-all" onClick={() => setView('signin')}>Sign in</button>
                </div>
              </div>
            </div>
          )}

          {!success && view === 'verify' && (
            <div className="space-y-3">
              {vError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{vError}</div>}
              <div className="space-y-2">
                <Label htmlFor="v-email">Email</Label>
                <Input id="v-email" type="email" value={vEmail} onChange={(e) => setVEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-otp">OTP Code</Label>
                <Input id="v-otp" value={vOtp} onChange={(e) => setVOtp(e.target.value)} placeholder="123456" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" disabled={vLoading || !vEmail || !vOtp} onClick={async () => {
                  setVError(null); setVLoading(true);
                  try {
                    await mobileAuthService.verifyOTP({ email: vEmail, otp: vOtp });
                    // Success will be handled by authBus and show success view
                  } catch (e) { setVError(e?.message || 'Verification failed'); }
                  finally { setVLoading(false); }
                }}>{vLoading ? 'Verifying…' : 'Verify'}</Button>
                <Button variant="ghost" onClick={async () => {
                  try { await mobileAuthService.resendOTP({ email: vEmail, type: 'email_verification' }); } catch (e) { console.log(e.message) }
                }}>Resend</Button>
              </div>
            </div>
          )}

          {!success && view === 'forgot' && (
            <div className="space-y-3">
              {frError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{frError}</div>}
              <div className="space-y-2">
                <Label htmlFor="f-email">Email</Label>
                <Input id="f-email" type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" disabled={frLoading || !fEmail} onClick={async () => {
                  setFrError(null); setFrLoading(true);
                  try { await mobileAuthService.forgotPassword({ email: fEmail }); setView('reset'); }
                  catch (e) { setFrError(e?.message || 'Failed to send reset code'); }
                  finally { setFrLoading(false); }
                }}>{frLoading ? 'Sending…' : 'Send Reset Code'}</Button>
                <Button variant="ghost" onClick={() => setView('signin')}>Back</Button>
              </div>
            </div>
          )}

          {!success && view === 'reset' && (
            <div className="space-y-3">
              {frError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{frError}</div>}
              <div className="space-y-2">
                <Label htmlFor="r-email">Email</Label>
                <Input id="r-email" type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-otp">OTP Code</Label>
                <Input id="r-otp" value={rOtp} onChange={(e) => setROtp(e.target.value)} placeholder="123456" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="r-pw">New Password</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="r-pw" type={rPwVisible ? 'text' : 'password'} value={rPass} onChange={(e) => setRPass(e.target.value)} />
                    <Button type="button" variant="outline" size="icon" onClick={() => setRPwVisible(v => !v)} aria-label="Toggle password visibility">
                      {rPwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-pw2">Confirm</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="r-pw2" type={rPw2Visible ? 'text' : 'password'} value={rPass2} onChange={(e) => setRPass2(e.target.value)} />
                    <Button type="button" variant="outline" size="icon" onClick={() => setRPw2Visible(v => !v)} aria-label="Toggle password visibility">
                      {rPw2Visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" disabled={frLoading || !fEmail || !rOtp || !rPass || rPass !== rPass2} onClick={async () => {
                  setFrError(null); setFrLoading(true);
                  try { await mobileAuthService.resetPassword({ email: fEmail, otp: rOtp, newPassword: rPass, confirmPassword: rPass2 }); setView('signin'); }
                  catch (e) { setFrError(e?.message || 'Reset failed'); }
                  finally { setFrLoading(false); }
                }} aria-busy={frLoading}>{frLoading ? 'Resetting…' : 'Reset Password'}</Button>
                <Button variant="ghost" onClick={() => setView('signin')}>Back</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
