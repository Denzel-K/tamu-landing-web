import { ReactNode, useEffect, useMemo, useState } from "react";
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

type StepCardProps = {
  step: number;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

const StepCard = ({ step, title, description, actions, children }: StepCardProps) => (
  <section className="rounded-3xl border border-border/60 bg-background/80 p-6 md:p-8 shadow-sm space-y-6 transition hover:border-primary/50">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-base tracking-normal text-primary">
            {step}
          </span>
          Step {step}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions && <div className="flex-none text-right">{actions}</div>}
    </div>
    {children}
  </section>
);

type StepDefinition = {
  title: string;
  description: string;
  shortLabel: string;
  actions?: ReactNode;
  content: ReactNode;
};

const FeedbackPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState(defaultFormState);
  const [successLinks, setSuccessLinks] = useState<FeedbackLinks | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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

  const steps: StepDefinition[] = [
    {
      title: "Who's sharing today?",
      description: isPrefilled
        ? "Linked to your tester invite. Make sure the basics look correct before continuing."
        : "Use the same name and email from the alpha list so we can match your token.",
      shortLabel: "Identity",
      actions:
        isPrefilled && (
          <Button type="button" variant="ghost" size="sm" onClick={clearToken}>
            Switch tester link
          </Button>
        ),
      content: (
        <div className="space-y-6">
          {testerDetails?.feedbackSubmittedAt && (
            <p className="text-xs text-emerald-500">
              Last shared on {new Date(testerDetails.feedbackSubmittedAt).toLocaleString()}
            </p>
          )}
          {sessionQuery.isError && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {sessionError?.message || "Unable to verify this tester link. Clear it and re-enter your invite email."}
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border/60 bg-card/40 p-5">
              <p className="text-sm font-semibold text-primary mb-2 uppercase">What to focus on</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {heroFeatures.map((item) => (
                  <li key={item.title} className="rounded-2xl border border-border/50 p-3">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-dashed border-primary/50 bg-primary/5 p-5 space-y-3">
              <p className="text-sm font-semibold text-primary uppercase">Need your token?</p>
              <p className="text-sm text-muted-foreground">
                Each tester has a unique link. Lost it? Request a fresh invite using the same email, or ping the admin.
              </p>
              <Button variant="outline" asChild>
                <a href="/">Request another invite</a>
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Where did you spend time?",
      description: "Tag every surface you actually touched so we can weigh your notes correctly.",
      shortLabel: "Surfaces",
      actions:
        sessionLinks?.feedbackForm && (
          <Button type="button" variant="link" className="text-xs" onClick={() => copyPersonalLink(sessionLinks?.feedbackForm)}>
            Copy my edit link
          </Button>
        ),
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {featureOptions.map((feature) => {
            const checked = formState.featuresTried.includes(feature.id);
            return (
              <button
                type="button"
                key={feature.id}
                onClick={() => handleFeatureToggle(feature.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  checked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:border-primary/60 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{feature.title}</p>
                  {checked && <Check className="h-4 w-4" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "What stood out?",
      description: "Quick notes help us understand why each moment mattered.",
      shortLabel: "Highlights",
      content: (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="highlight">What delighted you?</Label>
            <Textarea
              id="highlight"
              value={formState.highlight}
              onChange={(event) => handleInputChange("highlight", event.target.value)}
              placeholder="The rewards wallet felt instantly clear..."
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blockers">What slowed you down?</Label>
            <Textarea
              id="blockers"
              value={formState.blockers}
              onChange={(event) => handleInputChange("blockers", event.target.value)}
              placeholder="Map filters reset when I changed cuisines..."
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wishlist">Wishlist / experiments</Label>
            <Textarea
              id="wishlist"
              value={formState.wishlist}
              onChange={(event) => handleInputChange("wishlist", event.target.value)}
              placeholder="Let me save favorite food journeys..."
              className="min-h-[120px]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "How did it feel overall?",
      description: "Score each moment from 1 (major gaps) to 5 (polished) so we know where to focus.",
      shortLabel: "Feels",
      content: (
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
                        ? "border-primary bg-primary/15 text-primary shadow-sm"
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
      ),
    },
    {
      title: "Visibility & reach-outs",
      description: "Choose how other testers see your name and whether the team can follow up.",
      shortLabel: "Visibility",
      content: (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">How should we display you on the tester wall?</p>
              <p className="text-xs text-muted-foreground">
                Admins still see your real profile; this only affects the public tester wall.
              </p>
            </div>
            <Badge variant="outline" className="whitespace-nowrap">
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
                formState.visibility === "public" ? "border-primary bg-primary/10" : "border-border"
              )}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="public" id="visibility-public" className="sr-only" aria-label="Public" />
                <div>
                  <p className="font-medium">Show my name</p>
                  <p className="text-xs text-muted-foreground">Great when you want to be credited in updates.</p>
                </div>
              </div>
            </label>
            <label
              htmlFor="visibility-anonymous"
              className={cn(
                "rounded-2xl border p-4",
                formState.visibility === "anonymous" ? "border-primary bg-primary/10" : "border-border"
              )}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="anonymous" id="visibility-anonymous" className="sr-only" aria-label="Anonymous" />
                <div>
                  <p className="font-medium">Stay anonymous</p>
                  <p className="text-xs text-muted-foreground">Your insights count without showing your name.</p>
                </div>
              </div>
            </label>
          </RadioGroup>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4">
            <div>
              <p className="text-sm font-medium">Can our product team reach out?</p>
              <p className="text-xs text-muted-foreground">
                Only for clarification or to invite you into a deeper research call.
              </p>
            </div>
            <Switch checked={formState.allowContact} onCheckedChange={(checked) => handleInputChange("allowContact", checked)} />
          </div>
        </div>
      ),
    },
  ];

  const totalSteps = steps.length;
  const activeStep = steps[currentStep];
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const scrollToStepTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, totalSteps - 1));
    setCurrentStep(nextIndex);
    scrollToStepTop();
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
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

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6 md:p-8 space-y-4 shadow-lg">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Guided feedback</p>
                <p className="text-lg font-semibold">
                  Step {currentStep + 1} of {totalSteps}
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">{Math.round(progressPercent)}% complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => goToStep(index)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : isComplete
                          ? "border-primary/50 text-foreground"
                          : "border-border text-muted-foreground hover:text-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px]",
                        isActive
                          ? "border-primary bg-primary/20 text-primary"
                          : isComplete
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                    {step.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <StepCard
              step={currentStep + 1}
              title={activeStep.title}
              description={activeStep.description}
              actions={activeStep.actions}
            >
              {activeStep.content}
            </StepCard>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep} className="w-full md:w-auto">
                  Back
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">Step 1 of {totalSteps}</span>
              )}

              {currentStep < totalSteps - 1 ? (
                <Button type="button" className="w-full md:w-auto" onClick={nextStep}>
                  Next: {steps[currentStep + 1].shortLabel}
                </Button>
              ) : (
                <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitMutation.isPending}>
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
              )}
            </div>
          </form>
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
