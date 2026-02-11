import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthModalWeb from "@/components/auth/AuthModalWeb";
import { authLocal, authBus } from "@/lib/auth/authLocal";
import mobileAuthService from "@/lib/auth/mobileAuthService";
import tamuLogo from "@/assets/tamu_logo.png";

export type AppHeaderProps = {
  /** The title/page indicator to display */
  pageTitle: string;
  /** Optional subtitle below the title */
  pageSubtitle?: string;
  /** Show back button on the left */
  showBackButton?: boolean;
  /** Custom back navigation path (default: -1) */
  backTo?: string | -1;
  /** Show signin/signup buttons (only when not authenticated) */
  showAuthButtons?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export default function AppHeaderWeb({
  pageTitle,
  pageSubtitle,
  showBackButton = false,
  backTo = -1,
  showAuthButtons = false,
  className = "",
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitial, setAuthInitial] = useState<"signin" | "signup">("signup");
  const [isAuthed, setIsAuthed] = useState<boolean>(!!authLocal.getAccessToken());
  const [userName, setUserName] = useState<string | null>(
    authLocal.getUser()?.firstName
      ? `${authLocal.getUser()?.firstName} ${authLocal.getUser()?.lastName || ''}`.trim()
      : null
  );
  const [userEmail, setUserEmail] = useState<string | null>(authLocal.getUser()?.email || null);

  useEffect(() => {
    const unsubLogin = authBus.subscribe('login', () => {
      setIsAuthed(true);
      const u = authLocal.getUser();
      setUserName(u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : null);
      setUserEmail(u?.email || null);
    });
    const unsubLogout = authBus.subscribe('logout', () => {
      setIsAuthed(false);
      setUserName(null);
      setUserEmail(null);
    });
    return () => {
      unsubLogin();
      unsubLogout();
    };
  }, []);

  const handleBack = () => {
    if (typeof backTo === 'string') {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div
        className={`sticky top-0 z-40 bg-background border-b-2 border-primary/20 shadow-sm ${className}`}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left side: Logo + Back button + Page title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* TAMU Logo */}
            <div className="">
              <img
                src={tamuLogo}
                alt="TAMU Logo"
                className="h-16 w-16 object-contain"
              />
            </div>

            {/* Vertical separator */}
            <div className="h-8 w-px bg-border shrink-0" />

            {/* Back button + Page info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="px-2 shrink-0 hover:bg-primary/10 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="sr-only">Back</span>
                </Button>
              )}
              <div className="min-w-0">
                <div className="text-base font-bold truncate text-foreground">{pageTitle}</div>
                {pageSubtitle && (
                  <div className="text-xs text-muted-foreground truncate font-medium">{pageSubtitle}</div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Auth buttons or user info */}
          <div className="flex items-center gap-2 shrink-0">
            {showAuthButtons && !isAuthed ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAuthInitial('signin');
                    setAuthOpen(true);
                  }}
                  className="font-semibold border-primary/30 hover:bg-primary/10 hover:border-primary transition-colors"
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthInitial('signup');
                    setAuthOpen(true);
                  }}
                  className="font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Sign up
                </Button>
              </>
            ) : isAuthed ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                  <div className="text-sm font-bold leading-tight truncate max-w-[200px] sm:max-w-[280px] text-foreground">
                    {userName || 'Account'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[280px] font-medium">
                    {userEmail}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await mobileAuthService.logout();
                    } catch {
                      /* noop */
                    }
                    navigate('/discover');
                  }}
                  className="font-semibold border-[1.5px] border-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Logout
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModalWeb
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialView={authInitial}
        onAuthed={() => {
          /* success handled by auth bus */
        }}
      />
    </>
  );
}
