import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ShieldCheck,
  Loader2,
  SendHorizontal,
  RefreshCw,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AlphaTesterStatus, fetchAlphaTesters, sendAlphaTesterLink, updateAlphaTesterStatus } from "@/lib/alpha-testers/service";

const ADMIN_PASS_HINT = (import.meta.env.VITE_ADMIN_PASS as string | undefined)?.trim();

const statusStyles: Record<AlphaTesterStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  denied: "bg-rose-500/15 text-rose-600 border border-rose-500/30",
};

const ManageTesters = () => {
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusActionId, setStatusActionId] = useState<string | null>(null);
  const [linkActionId, setLinkActionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const stored = sessionStorage.getItem("tamu-admin-pass");
    if (stored) {
      setAdminSecret(stored);
    }
  }, []);

  useEffect(() => {
    if (adminSecret) {
      sessionStorage.setItem("tamu-admin-pass", adminSecret);
    } else {
      sessionStorage.removeItem("tamu-admin-pass");
    }
  }, [adminSecret]);

  const testersQuery = useQuery({
    queryKey: ["alpha-testers"],
    queryFn: async () => {
      if (!adminSecret) {
        throw new Error("Missing admin credentials");
      }
      const response = await fetchAlphaTesters(adminSecret);
      return response.testers ?? [];
    },
    enabled: Boolean(adminSecret),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AlphaTesterStatus }) => {
      if (!adminSecret) throw new Error("Missing admin credentials");
      return updateAlphaTesterStatus(id, status, adminSecret);
    },
    onMutate: ({ id }) => setStatusActionId(id),
    onSuccess: (response) => {
      toast({
        title: "Status updated",
        description: response.message ?? "Tester status changed.",
      });
      queryClient.invalidateQueries({ queryKey: ["alpha-testers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to update tester",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setStatusActionId(null),
  });

  const sendLinkMutation = useMutation({
    mutationFn: async (testerId: string) => {
      if (!adminSecret) throw new Error("Missing admin credentials");
      return sendAlphaTesterLink(testerId, adminSecret);
    },
    onMutate: (id) => setLinkActionId(id),
    onSuccess: (response) => {
      toast({
        title: "Invite sent",
        description: response.message ?? "Alpha download link emailed.",
      });
      queryClient.invalidateQueries({ queryKey: ["alpha-testers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to send link",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setLinkActionId(null),
  });

  const testers = testersQuery.data ?? [];
  const isLoading = testersQuery.isLoading || testersQuery.isFetching;
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleCopyEmail = async (email: string) => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard not available");
      }
      await navigator.clipboard.writeText(email);
      toast({
        title: "Email copied",
        description: email,
      });
    } catch (error) {
      toast({
        title: "Unable to copy email",
        description: error instanceof Error ? error.message : "Clipboard is not available.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setAuthError("Password required");
      return;
    }
    if (ADMIN_PASS_HINT && trimmed !== ADMIN_PASS_HINT) {
      setAuthError("Incorrect password");
      return;
    }
    setAdminSecret(trimmed);
    setPasswordInput("");
    setAuthError("");
  };

  const sortedTesters = useMemo(
    () => [...testers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [testers]
  );

  const requireAuth = !adminSecret;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-12 space-y-10">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">Alpha Program</p>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Manage Testers
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Track early-access requests, update their status, and deliver the alpha download link without exposing the
              page publicly.
            </p>
          </div>

          {adminSecret && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => testersQuery.refetch()}
                disabled={testersQuery.isRefetching}
              >
                {testersQuery.isRefetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh list
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (isLoading || bulkLoading) return;
                  const pending = testers.filter((tester) => tester.status === "pending");
                  if (pending.length === 0) {
                    toast({
                      title: "No pending testers",
                      description: "Everyone on the list is already approved.",
                    });
                    return;
                  }
                  setBulkLoading(true);
                  const emails = pending.map((t) => t.email).join(",");
                  try {
                    if (typeof navigator === "undefined" || !navigator.clipboard) {
                      throw new Error("Clipboard not available");
                    }
                    await navigator.clipboard.writeText(emails);
                  } catch (error) {
                    setBulkLoading(false);
                    toast({
                      title: "Clipboard error",
                      description:
                        error instanceof Error ? error.message : "Cannot copy to clipboard. Please try manually.",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Pending emails copied",
                    description: `${pending.length} addresses copied as comma-separated list.`,
                  });
                  try {
                    await Promise.all(
                      pending.map((tester) =>
                        statusMutation.mutateAsync({ id: tester._id, status: "approved" })
                      )
                    );
                  } catch (err) {
                    // statusMutation already toasts error; nothing else needed
                  } finally {
                    setBulkLoading(false);
                  }
                }}
                disabled={bulkLoading}
              >
                {bulkLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                  </>
                ) : (
                  <>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Copy pending emails
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAdminSecret(null)}
                className="text-muted-foreground"
              >
                <Lock className="mr-2 h-4 w-4" />
                Lock page
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur p-6 shadow-xl">
          {adminSecret ? (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Link sent</TableHead>
                    <TableHead className="w-[220px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                        Loading testers...
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && sortedTesters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No testers yet. Once users join from the landing page, they will appear here.
                      </TableCell>
                    </TableRow>
                  )}

                  {sortedTesters.map((tester) => (
                    <TableRow key={tester._id}>
                      <TableCell className="font-medium">{tester.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${tester.email}`}
                            className="text-primary hover:underline"
                            rel="noreferrer"
                          >
                            {tester.email}
                          </a>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleCopyEmail(tester.email)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[tester.status]}>{tester.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(tester.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tester.linkSentAt
                          ? formatDistanceToNow(new Date(tester.linkSentAt), { addSuffix: true })
                          : "Not yet"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {tester.status !== "approved" ? (
                            (() => {
                              const pendingForRow = statusMutation.isPending && statusActionId === tester._id;
                              return (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => statusMutation.mutate({ id: tester._id, status: "approved" })}
                                  disabled={pendingForRow}
                                >
                                  {pendingForRow ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="mr-2 h-4 w-4" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                              );
                            })()
                          ) : (
                            (() => {
                              const pendingForRow = sendLinkMutation.isPending && linkActionId === tester._id;
                              return (
                                <Button
                                  size="sm"
                                  onClick={() => sendLinkMutation.mutate(tester._id)}
                                  disabled={pendingForRow}
                                >
                                  {pendingForRow ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Sending
                                    </>
                                  ) : (
                                    <>
                                      <SendHorizontal className="mr-2 h-4 w-4" />
                                      {tester.linkSentAt ? "Resend link" : "Send link"}
                                    </>
                                  )}
                                </Button>
                              );
                            })()
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <KeyRound className="mx-auto mb-4 h-12 w-12 text-primary" />
              Enter the admin password to manage tester invites.
            </div>
          )}
        </div>
      </div>

      <Dialog open={requireAuth} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Admin Access Required</DialogTitle>
            <DialogDescription>
              This page is hidden from navigation. Enter the admin password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-pass">Password</Label>
              <div className="relative">
                <Input
                  id="admin-pass"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder="********"
                  autoFocus
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center rounded-md px-2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
            </div>
            <Button type="submit" className="w-full">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Unlock manage testers
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTesters;
