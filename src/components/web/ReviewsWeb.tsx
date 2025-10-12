import React, { useEffect, useMemo, useState } from "react";
import * as Reviews from "@/lib/api/reviews";
import { fetchMe } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReviewsWeb({ restaurantId }: { restaurantId: string }) {
  const [reviews, setReviews] = useState<Reviews.Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => isAuthed && eligible && rating > 0 && comment.trim().length > 0, [isAuthed, eligible, rating, comment]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await fetchMe();
      setIsAuthed(!!me?.user?.id);
      const [r, elig] = await Promise.all([
        Reviews.listReviews(restaurantId),
        Reviews.checkEligibility(restaurantId).catch(() => ({ isCustomer: false } as any)),
      ]);
      setReviews(r?.reviews || []);
      setEligible(!!(elig as any)?.isCustomer);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load reviews";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [restaurantId]);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await Reviews.createReview(restaurantId, { rating, comment: comment.trim() });
      setComment("");
      setRating(0);
      await loadAll();
    } catch (e) {
      // silently fail to keep UX simple; could add toast if available
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading reviews…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      {(!reviews || reviews.length === 0) && (
        <div className="text-sm text-muted-foreground">
          No reviews yet.
        </div>
      )}
      <ul className="space-y-3">
        {reviews.map((rv) => (
          <li key={rv.id} className="rounded-lg border border-border p-3 bg-card">
            <div className="flex items-center justify-between">
              <div className="font-medium text-foreground">{rv.user || "User"}</div>
              <div className="text-xs text-muted-foreground">{rv.createdAt ? new Date(rv.createdAt).toLocaleString() : ""}</div>
            </div>
            <div className="mt-1 text-sm">Rating: {rv.rating}/5</div>
            <div className="text-sm text-foreground mt-1 whitespace-pre-line">{rv.comment}</div>
          </li>
        ))}
      </ul>

      {isAuthed ? (
        eligible ? (
          <div className="rounded-lg border border-border p-3 bg-card space-y-2">
            <div className="text-sm font-semibold">Leave a review</div>
            <div className="flex items-center gap-2">
              <Input placeholder="Rating (1-5)" inputMode="numeric" className="w-28" value={String(rating || "")} onChange={(e) => setRating(Number(String(e.target.value).replace(/[^0-9]/g, "")))} />
              <Input placeholder="Share your experience…" value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button disabled={!canSubmit || submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit"}</Button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Complete an order to leave a review.</div>
        )
      ) : (
        <div className="text-xs text-muted-foreground">Sign in to leave a review.</div>
      )}
    </div>
  );
}
