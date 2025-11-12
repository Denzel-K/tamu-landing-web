import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAllFeedback } from "@/lib/feedback/service";
import { ShieldCheck, Users, RefreshCw, Sparkles } from "lucide-react";

const featureLabels: Record<string, string> = {
  discover: "Discover",
  order: "Order & checkout",
  reservations: "Reservations",
  experiences: "Experiences",
  rewards: "Rewards",
  reviews: "Reviews",
  ui: "UI polish",
};

const FeedbackAllPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [adminSecret, setAdminSecret] = useState<string | null>(() => sessionStorage.getItem("tamu-admin-pass"));
  const [adminInput, setAdminInput] = useState("");
  const [tokenAccess, setTokenAccess] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const searchToken = searchParams.get("token");

  useEffect(() => {
    if (searchToken) {
      setTokenAccess(searchToken);
      sessionStorage.setItem("tamu-feedback-token", searchToken);
    } else {
      const stored = sessionStorage.getItem("tamu-feedback-token");
      if (stored) {
        setTokenAccess(stored);
        setSearchParams({ token: stored });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchToken]);

  const feedbackQuery = useQuery({
    queryKey: ["feedback-all", adminSecret, tokenAccess],
    queryFn: () => fetchAllFeedback({ adminPass: adminSecret || undefined, token: tokenAccess || undefined }),
    enabled: Boolean(adminSecret) || Boolean(tokenAccess),
    retry: 1,
  });

  const feedbackData = feedbackQuery.data;
  const totalResponses = feedbackData?.feedback.length || 0;

  const averages = useMemo(() => {
    if (!feedbackData?.feedback.length) return { overall: 0, clarity: 0, reliability: 0 };
    const sum = feedbackData.feedback.reduce(
      (acc, entry) => {
        acc.overall += entry.overallExperience;
        acc.clarity += entry.journeyClarity;
        acc.reliability += entry.reliabilityScore;
        return acc;
      },
      { overall: 0, clarity: 0, reliability: 0 }
    );
    return {
      overall: (sum.overall / feedbackData.feedback.length).toFixed(1),
      clarity: (sum.clarity / feedbackData.feedback.length).toFixed(1),
      reliability: (sum.reliability / feedbackData.feedback.length).toFixed(1),
    };
  }, [feedbackData]);

  const topFeatures = useMemo(() => {
    if (!feedbackData?.feedback.length) return [];
    const counts: Record<string, number> = {};
    feedbackData.feedback.forEach((entry) => {
      entry.featuresTried?.forEach((feature) => {
        counts[feature] = (counts[feature] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [feedbackData]);

  const viewerRole = feedbackData?.viewer.role;
  const currentTesterId = feedbackData?.viewer.testerId;

  const applyAdminPass = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminInput.trim()) return;
    sessionStorage.setItem("tamu-admin-pass", adminInput.trim());
    setAdminSecret(adminInput.trim());
    setAdminInput("");
  };

  const applyToken = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokenInput.trim()) return;
    sessionStorage.setItem("tamu-feedback-token", tokenInput.trim());
    setSearchParams({ token: tokenInput.trim() });
    setTokenAccess(tokenInput.trim());
    setTokenInput("");
  };

  const clearAccess = () => {
    sessionStorage.removeItem("tamu-admin-pass");
    sessionStorage.removeItem("tamu-feedback-token");
    setAdminSecret(null);
    setTokenAccess(null);
    setSearchParams({});
    queryClient.removeQueries({ queryKey: ["feedback-all"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
        <header className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">Tester wall</p>
          <h1 className="text-3xl md:text-4xl font-bold">All TAMU alpha feedback</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access is limited to admins or testers that already shared feedback. Names stay anonymous based on each
            tester&apos;s preference; admins still see original metadata.
          </p>
        </header>

        {!adminSecret && !tokenAccess && (
          <div className="grid gap-6 lg:grid-cols-2">
            <form
              onSubmit={applyAdminPass}
              className="rounded-3xl border border-border/60 bg-card/70 p-6 space-y-4 shadow-lg"
            >
              <Label htmlFor="admin-pass">Admin pass</Label>
              <Input
                id="admin-pass"
                type="password"
                placeholder="••••••••"
                value={adminInput}
                onChange={(event) => setAdminInput(event.target.value)}
              />
              <Button type="submit" className="w-full">
                Unlock with admin pass
              </Button>
              <p className="text-xs text-muted-foreground">
                Same pass you use on the Manage Testers page. We keep it in session storage for this tab only.
              </p>
            </form>

            <form
              onSubmit={applyToken}
              className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 space-y-4 shadow-lg"
            >
              <Label htmlFor="token">Tester link</Label>
              <Input
                id="token"
                placeholder="Paste the token from your email"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
              />
              <Button type="submit" variant="secondary" className="w-full">
                Use my tester access
              </Button>
              <p className="text-xs text-muted-foreground">
                This token is included in the email you receive immediately after submitting feedback.
              </p>
            </form>
          </div>
        )}

        {(adminSecret || tokenAccess) && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {viewerRole === "admin" ? "Admin view (names + emails visible)" : "Tester view (names/anonymity respected)"}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => feedbackQuery.refetch()} disabled={feedbackQuery.isFetching}>
                {feedbackQuery.isFetching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAccess} className="text-muted-foreground">
                Clear access
              </Button>
            </div>
          </div>
        )}

        {feedbackQuery.isError && (
          <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load feedback with the provided credentials. Double-check your admin pass or tester token.
          </div>
        )}

        {feedbackQuery.isLoading && (adminSecret || tokenAccess) && (
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 text-center text-muted-foreground shadow">
            Loading feedback wall…
          </div>
        )}

        {feedbackData && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Responses</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold">{totalResponses}</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" /> testers
                  </span>
                </div>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Avg. experience</p>
                <p className="text-4xl font-bold">{averages.overall}</p>
                <p className="text-xs text-muted-foreground">Flow rating out of 5</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top focus</p>
                {topFeatures.length ? (
                  <ScrollArea className="h-[80px]">
                    <div className="space-y-2 pr-2">
                      {topFeatures.map(([feature, count]) => (
                        <div key={feature} className="flex items-center justify-between text-sm">
                          <span>{featureLabels[feature] || feature}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">No signals yet</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Journey clarity</p>
                <p className="text-3xl font-semibold">{averages.clarity}</p>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Reliability</p>
                <p className="text-3xl font-semibold">{averages.reliability}</p>
              </div>
            </div>

            <div className="space-y-6">
              {feedbackData.feedback.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-3xl border border-border/60 bg-background/80 p-6 shadow ${
                    currentTesterId && entry.testerId === currentTesterId ? "ring-2 ring-primary/60" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{entry.name}</h3>
                      {viewerRole === "admin" && (
                        <p className="text-sm text-muted-foreground">
                          {entry.originalName} • {entry.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant={entry.visibility === "anonymous" ? "secondary" : "default"}>
                      {entry.visibility === "anonymous" ? "Anonymized" : "Public"}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 my-4">
                    <div className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="text-2xl font-semibold">{entry.overallExperience}/5</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs text-muted-foreground">Clarity</p>
                      <p className="text-2xl font-semibold">{entry.journeyClarity}/5</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs text-muted-foreground">Reliability</p>
                      <p className="text-2xl font-semibold">{entry.reliabilityScore}/5</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {entry.featuresTried?.length ? (
                      entry.featuresTried.map((feature) => (
                        <Badge key={feature} variant="outline">
                          {featureLabels[feature] || feature}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No features selected</span>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-4 text-sm">
                    <section className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs uppercase text-muted-foreground mb-1">Highlights</p>
                      <p>{entry.highlight || "—"}</p>
                    </section>
                    <section className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs uppercase text-muted-foreground mb-1">Blockers</p>
                      <p>{entry.blockers || "—"}</p>
                    </section>
                    <section className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs uppercase text-muted-foreground mb-1">Wishlist / experiments</p>
                      <p>{entry.wishlist || "—"}</p>
                    </section>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Need to submit or update your own feedback?</p>
          <Button asChild variant="secondary">
            <Link to="/feedback">
              <Sparkles className="mr-2 h-4 w-4" />
              Go to the feedback form
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAllPage;
