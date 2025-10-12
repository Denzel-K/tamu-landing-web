import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchMe } from "@/lib/api/auth";
import { useEffect, useState } from "react";

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AuthGateModal({ open, onOpenChange }: AuthGateModalProps) {
  const [checking, setChecking] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!open) return;
    (async () => {
      setChecking(true);
      try {
        const me = await fetchMe();
        if (mounted) setAuthed(!!me?.user?.id);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  useEffect(() => {
    if (authed && open) onOpenChange(false);
  }, [authed, open, onOpenChange]);

  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  const webBase = env.VITE_WEB_APP_BASE || "https://tamu-web-app.example.com";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            You need an account to continue with ordering or reservations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-2">
          <Button asChild disabled={checking}>
            <a href={`${webBase}/auth/signin`} target="_blank" rel="noreferrer">Sign in</a>
          </Button>
          <Button variant="outline" asChild disabled={checking}>
            <a href={`${webBase}/auth/signup`} target="_blank" rel="noreferrer">Create account</a>
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            After signing in, return to this tab to continue.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
