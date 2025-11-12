import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, SendHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { joinAlphaTesters } from "@/lib/alpha-testers/service";

interface AlphaTesterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AlphaTesterModal = ({ open, onOpenChange }: AlphaTesterModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      return joinAlphaTesters({
        name: name.trim(),
        email: email.trim(),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "You're on the list!",
        description: data?.message || "We'll email you the download link in the next 12–24 hours.",
      });
      setName("");
      setEmail("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not save your request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disabled = mutation.isPending || !name.trim() || !email.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join Alpha Testing (Android only)</DialogTitle>
          <DialogDescription>
            Share your name and email. We’ll send a confirmation now and the download link as soon as the build is ready
            for you (typically within 12–24 hours).
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (disabled) return;
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="alpha-name">Full name</Label>
            <Input
              id="alpha-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Samantha N."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alpha-email">Email address</Label>
            <Input
              id="alpha-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <p className="text-sm text-primary">
              Tip: use an email already signed in to Google Play to make this easier.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
            You’ll immediately receive a confirmation email. Please reply there if you want to share device details or
            test scenarios ahead of time.
          </div>

          <Button type="submit" className="w-full" disabled={disabled}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <SendHorizontal className="mr-2 h-4 w-4" />
                Join alpha testing
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
