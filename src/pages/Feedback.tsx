import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Check, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchFeedbackSession,
  submitFeedback,
  SubmitFeedbackPayload,
  FeedbackSessionResponse,
  FeedbackSession,
  FeedbackLinks,
  SubmitFeedbackResponse,
} from "@/lib/feedback/service";

const ratingOptions = [1, 2, 3, 4, 5];

const featureOptions = [
  {
    id: "discover",
    title: "Discover local food",
    description: "Geo-tagged menus, list and map browsing",
  },
  {
    id: "order",
    title: "Order & checkout",
    description: "Cart, delivery modes, tracking",
  },
  {
    id: "reservations",
    title: "Reservations",
    description: "Scheduling tables or private dining",
  },
  {
    id: "experiences",
    title: "Experiences",
    description: "Pop-ups, mixology, exclusive events",
  },
  {
    id: "rewards",
    title: "Rewards & loyalty",
    description: "Points wallet, WhatsApp nudges",
  },
  {
    id: "reviews",
    title: "Reviews & community",
    description: "Sharing stories + rating meals",
  },
  {
    id: "ui",
    title: "Interface polish",
    description: "Animation, navigation, copy tone",
  },
];

const defaultFormState = {
  name: "",
  email: "",
  overallExperience: 4,
  journeyClarity: 4,
  reliabilityScore: 4,
  featuresTried: [] as string[],
  highlight: "",
  blockers: "",
  wishlist: "",
  visibility: "public" as "public" | "anonymous",
  allowContact: true,
};

type RatingField = "overallExperience" | "journeyClarity" | "reliabilityScore";

const ratingFieldConfig: { key: RatingField; label: string }[] = [
  { key: "overallExperience", label: "Overall" },
  { key: "journeyClarity", label: "Discover ➜ Order ➜ Reward" },
  { key: "reliabilityScore", label: "Reliability" },
];

const FeedbackPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState(defaultFormState);
  const [successLinks, setSuccessLinks] = useState<FeedbackLinks | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();

  const queryToken = searchParams.get("token");

  useEffect(() => {
    if (!queryToken) {
      const stored = sessionStorage.getItem("tamu-feedback-token");
      if (stored) {
        setSearchParams({ token: stored });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionQuery = useQuery<FeedbackSessionResponse, Error>({
    queryKey: ["feedback-session", queryToken],
    queryFn: () => fetchFeedbackSession({ token: queryToken || undefined }),
    enabled: Boolean(queryToken),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const sessionData = sessionQuery.data;
  const testerDetails = sessionData?.tester;
  const existingFeedback = sessionData?.feedback;
  const sessionLinks = sessionData?.links;
  const personalEditLink = successLinks?.feedbackForm ?? null;
  const allFeedbackLink = successLinks?.allFeedback ?? null;

  useEffect(() => {
    const nextToken = sessionData?.tester?.feedbackToken;
    if (nextToken) {
      sessionStorage.setItem("tamu-feedback-token", nextToken);
      if (nextToken !== queryToken) {
        setSearchParams({ token: nextToken });
      }
    }
  }, [sessionData?.tester?.feedbackToken, queryToken, setSearchParams]);

  const feedbackSignature = existingFeedback ? `${existingFeedback.id}-${existingFeedback.updatedAt}` : "none";

  useEffect(() => {
    if (!testerDetails) return;
    setFormState((prev) => ({
      ...prev,
      name: testerDetails.name,
      email: testerDetails.email,
      ...(existingFeedback
        ? {
            overallExperience: existingFeedback.overallExperience,
            journeyClarity: existingFeedback.journeyClarity,
            reliabilityScore: existingFeedback.reliabilityScore,
            featuresTried: existingFeedback.featuresTried || [],
            highlight: existingFeedback.highlight || "",
            blockers: existingFeedback.blockers || "",
            wishlist: existingFeedback.wishlist || "",
            visibility: existingFeedback.visibility,
            allowContact: existingFeedback.allowContact,
          }
        : {}),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testerDetails?.id, feedbackSignature]);

  const sessionError = sessionQuery.error as Error | null;

  const submitMutation = useMutation<SubmitFeedbackResponse, Error>({
    mutationFn: async () => {
      const payload: SubmitFeedbackPayload = {
        token: testerDetails?.feedbackToken || queryToken || undefined,
        email: testerDetails ? undefined : formState.email,
        name: formState.name,
        overallExperience: formState.overallExperience,
        journeyClarity: formState.journeyClarity,
        reliabilityScore: formState.reliabilityScore,
        featuresTried: formState.featuresTried,
        highlight: formState.highlight,
        blockers: formState.blockers,
        wishlist: formState.wishlist,
        visibility: formState.visibility,
        allowContact: formState.allowContact,
      };
      return submitFeedback(payload);
    },
    onSuccess: (response) => {
      toast({
        title: "Feedback saved",
        description: response.message || "Your notes help us shape the customer journey.",
      });
      if (response.tester?.feedbackToken) {
        sessionStorage.setItem("tamu-feedback-token", response.tester.feedbackToken);
        if (response.tester.feedbackToken !== queryToken) {
          setSearchParams({ token: response.tester.feedbackToken });
        }
      }
      setSuccessLinks(response.links || null);
      setShowSuccessModal(true);
      sessionQuery.refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isPrefilled = Boolean(testerDetails);

  const heroFeatures = useMemo(
    () => [
      { title: "Discovery -> Orders -> Rewards flow", description: "Does the hand-off feel natural?" },
      { title: "Reservations & experiences", description: "Booking tables or cultural pop-ups" },
      { title: "Loyalty nudges", description: "WhatsApp prompts, progress indicators, and rewards wallet" },
    ],
    []
  );

  const handleFeatureToggle = (featureId: string) => {
    setFormState((prev) => {
      const exists = prev.featuresTried.includes(featureId);
      return {
        ...prev,
        featuresTried: exists ? prev.featuresTried.filter((value) => value !== featureId) : [...prev.featuresTried, featureId],
      };
    });
  };

  const handleRatingChange = (field: RatingField, value: number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPrefilled && !formState.email) {
      toast({
        title: "Email required",
        description: "We use your alpha tester email to match your invite.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate();
  };

  const clearToken = () => {
    sessionStorage.removeItem("tamu-feedback-token");
    setSearchParams({});
    setFormState({ ...defaultFormState });
  };

  const copyPersonalLink = (link?: string | null) => {
    if (!link) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast({
        title: "Clipboard unavailable",
        description: "Copy the link manually from your browser.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard
      .writeText(link)
      .then(() =>
        toast({
          title: "Link copied",
          description: "Save it so you can return anytime.",
        })
      )
      .catch(() =>
        toast({
          title: "Unable to copy link",
          description: "Copy it manually from your browser.",
          variant: "destructive",
        })
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-10 space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">TAMU alpha</p>
          <h1 className="text-3xl md:text-4xl font-bold">Share feedback on the customer journey</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Focus on the flow we showcased in the customer app experience: discovering restaurants, placing orders or
            reservations, tracking rewards, and sharing reviews. Your notes directly influence what we improve next.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-md p-6 space-y-8 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isPrefilled
                    ? "Connected to your tester invite. Edit anything you'd like."
                    : "Enter the same name & email you used to join the alpha list."}
                </p>
                {testerDetails?.feedbackSubmittedAt && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Feedback last updated {new Date(testerDetails.feedbackSubmittedAt).toLocaleString()}
                  </p>
                )}
              </div>
              {isPrefilled && (
                <Button type="button" variant="ghost" size="sm" onClick={clearToken}>
                  Switch tester link
                </Button>
              )}
            </div>

            {sessionQuery.isError && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {sessionError?.message || "Unable to verify this tester link. You can clear it and enter your email."}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  required
                  placeholder="Ada Tester"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  required={!isPrefilled}
                  disabled={isPrefilled}
                  placeholder="tester@email.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">How did it feel?</p>
                <p className="text-xs text-muted-foreground">5 = polished, 1 = major gaps</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {ratingFieldConfig.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-border/60 p-4">
                    <p className="text-sm font-medium mb-2">{item.label}</p>
                    <div className="flex gap-2">
                      {ratingOptions.map((value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => handleRatingChange(item.key, value)}
                          className={cn(
                            "flex-1 rounded-lg border px-0 py-2 text-sm font-semibold transition",
                            formState[item.key] === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/60"
                          )}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Which surfaces did you really explore?</p>
                  <p className="text-xs text-muted-foreground">Helps us balance discovery vs. ordering vs. rewards.</p>
                </div>
                {sessionLinks?.feedbackForm && (
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs"
                    onClick={() => copyPersonalLink(sessionLinks?.feedbackForm)}
                  >
                    Copy my edit link
                  </Button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {featureOptions.map((feature) => {
                  const checked = formState.featuresTried.includes(feature.id);
                  return (
                    <button
                      type="button"
                      key={feature.id}
                      onClick={() => handleFeatureToggle(feature.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{feature.title}</p>
                        {checked && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <Label htmlFor="highlight">What delighted you?</Label>
                <Textarea
                  id="highlight"
                  value={formState.highlight}
                  onChange={(event) => handleInputChange("highlight", event.target.value)}
                  placeholder="The rewards wallet felt instantly clear..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="blockers">What slowed you down?</Label>
                <Textarea
                  id="blockers"
                  value={formState.blockers}
                  onChange={(event) => handleInputChange("blockers", event.target.value)}
                  placeholder="Map filters reset when I changed cuisines..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="wishlist">Wishlist / experiments</Label>
                <Textarea
                  id="wishlist"
                  value={formState.wishlist}
                  onChange={(event) => handleInputChange("wishlist", event.target.value)}
                  placeholder="Let me save favorite food journeys..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">How should we display your name on the tester wall?</p>
                  <p className="text-xs text-muted-foreground">
                    Admins always see your real details, but other testers only see what you pick here.
                  </p>
                </div>
                <Badge variant="outline">
                  {formState.visibility === "anonymous" ? "Visible as anonymous" : "Visible with name"}
                </Badge>
              </div>
              <RadioGroup
                value={formState.visibility}
                onValueChange={(value) => handleInputChange("visibility", value as "public" | "anonymous")}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label
                  htmlFor="visibility-public"
                  className={cn(
                    "rounded-2xl border p-4",
                    formState.visibility === "public" ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="visibility-public" className="sr-only" aria-label="Public" />
                    <div>
                      <p className="font-medium">Show my name</p>
                      <p className="text-xs text-muted-foreground">Best if you want to be credited in updates.</p>
                    </div>
                  </div>
                </label>
                <label
                  htmlFor="visibility-anonymous"
                  className={cn(
                    "rounded-2xl border p-4",
                    formState.visibility === "anonymous" ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="anonymous"
                      id="visibility-anonymous"
                      className="sr-only"
                      aria-label="Anonymous"
                    />
                    <div>
                      <p className="font-medium">Stay anonymous</p>
                      <p className="text-xs text-muted-foreground">Your insights still get counted, without your name.</p>
                    </div>
                  </div>
                </label>
              </RadioGroup>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4">
                <div>
                  <p className="text-sm font-medium">Can our product team reach out?</p>
                  <p className="text-xs text-muted-foreground">
                    Only for clarification or to invite you to a deeper research call.
                  </p>
                </div>
                <Switch checked={formState.allowContact} onCheckedChange={(checked) => handleInputChange("allowContact", checked)} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving feedback
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Send insights to TAMU
                </>
              )}
            </Button>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-background/70 p-6 shadow-lg">
              <p className="text-sm font-semibold text-primary mb-2 uppercase">What to focus on</p>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {heroFeatures.map((item) => (
                  <li key={item.title} className="rounded-2xl border border-border/50 p-3">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-dashed border-primary/50 bg-primary/5 p-6 space-y-4">
              <p className="text-sm font-semibold text-primary uppercase">Need your token?</p>
              <p className="text-sm text-muted-foreground">
                Each tester has a unique link. Lost it? Use the button below to request it again from the admin or rejoin
                using the same email.
              </p>
              <Button variant="outline" asChild>
                <a href="/">Request another invite</a>
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback received 🎉</DialogTitle>
            <DialogDescription>
              Thanks for pressure-testing the TAMU customer journey. Your token now unlocks the private tester wall.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {allFeedbackLink && (
              <Button asChild variant="secondary">
                <a href={allFeedbackLink} target="_blank" rel="noreferrer">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  View all tester feedback
                </a>
              </Button>
            )}
            {personalEditLink && (
              <Button
                variant="ghost"
                onClick={() => copyPersonalLink(personalEditLink)}
              >
                Copy my edit link
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackPage;
