import API_CONFIG from "@/lib/auth/mobileApiConfig";

const BASE = `${API_CONFIG.BASE_URL.replace(/\/$/, "")}/feedback`;

type ViewerRole = "admin" | "tester";
export type FeedbackVisibility = "public" | "anonymous";

export interface FeedbackEntry {
  _id?: string;
  id: string;
  testerId: string;
  name: string;
  originalName?: string;
  email?: string;
  visibility: FeedbackVisibility;
  overallExperience: number;
  journeyClarity: number;
  reliabilityScore: number;
  featuresTried: string[];
  highlight?: string;
  blockers?: string;
  wishlist?: string;
  allowContact: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackLinks {
  feedbackForm?: string | null;
  allFeedback?: string | null;
}

export interface FeedbackSession {
  tester: {
    id: string;
    name: string;
    email: string;
    feedbackSubmittedAt?: string;
    feedbackToken?: string;
  };
  feedback?: FeedbackEntry;
  links?: FeedbackLinks;
}

export interface SubmitFeedbackPayload {
  token?: string | null;
  email?: string;
  name?: string;
  overallExperience: number;
  journeyClarity: number;
  reliabilityScore: number;
  featuresTried?: string[];
  highlight?: string;
  blockers?: string;
  wishlist?: string;
  visibility?: FeedbackVisibility;
  allowContact?: boolean;
}

interface FeedbackListResponse {
  success: boolean;
  viewer: {
    role: ViewerRole;
    testerId?: string | null;
  };
  feedback: FeedbackEntry[];
}

async function feedbackRequest<T>(
  path: string,
  options: RequestInit = {},
  extras?: { adminPass?: string; token?: string | null }
): Promise<T> {
  const url = `${BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (extras?.adminPass) {
    headers["x-admin-pass"] = extras.adminPass;
  }

  if (extras?.token) {
    headers["x-feedback-token"] = extras.token;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // ignore JSON parsing errors
  }

  if (!response.ok || data?.success === false) {
    const message = data?.message || `Feedback request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export type FeedbackSessionResponse = { success: boolean } & FeedbackSession;

export function fetchFeedbackSession(params: { token?: string | null; email?: string | null }) {
  const query = new URLSearchParams();
  if (params.token) query.set("token", params.token);
  if (params.email) query.set("email", params.email);
  const qs = query.toString();
  const path = `/session${qs ? `?${qs}` : ""}`;
  return feedbackRequest<FeedbackSessionResponse>(path);
}

export type SubmitFeedbackResponse = { success: boolean; message: string } & FeedbackSession;

export function submitFeedback(payload: SubmitFeedbackPayload) {
  return feedbackRequest<SubmitFeedbackResponse>("/", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      token: payload.token || undefined,
    }),
  });
}

export function fetchTesterFeedback(testerId: string, adminPass: string) {
  return feedbackRequest<{ success: boolean; feedback: FeedbackEntry }>(
    `/tester/${encodeURIComponent(testerId)}`,
    { method: "GET" },
    { adminPass }
  );
}

export function fetchAllFeedback(params: { adminPass?: string | null; token?: string | null }) {
  return feedbackRequest<FeedbackListResponse>("/", { method: "GET" }, params);
}
