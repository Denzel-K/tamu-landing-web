import API_CONFIG from "@/lib/auth/mobileApiConfig";

export type AlphaTesterStatus = "pending" | "approved" | "denied";

export interface AlphaTester {
  _id: string;
  name: string;
  email: string;
  status: AlphaTesterStatus;
  notes?: string;
  joinEmailSentAt?: string;
  linkSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AlphaTesterApiResponse {
  success: boolean;
  message?: string;
  tester?: AlphaTester;
  testers?: AlphaTester[];
}

const ADMIN_HEADER = "x-admin-pass";
const BASE = `${API_CONFIG.BASE_URL.replace(/\/$/, "")}/alpha-testers`;

async function alphaTesterRequest(
  path: string,
  options: RequestInit = {},
  adminPass?: string
): Promise<AlphaTesterApiResponse> {
  const url = `${BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (adminPass) {
    headers[ADMIN_HEADER] = adminPass;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: AlphaTesterApiResponse | null = null;
  try {
    data = (await response.json()) as AlphaTesterApiResponse;
  } catch {
    // ignore
  }

  if (!response.ok || data?.success === false) {
    const message = data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data || { success: true };
}

export function joinAlphaTesters(payload: { name: string; email: string }) {
  return alphaTesterRequest("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAlphaTesters(adminPass: string) {
  return alphaTesterRequest("/", { method: "GET" }, adminPass);
}

export function updateAlphaTesterStatus(
  id: string,
  status: AlphaTesterStatus,
  adminPass: string,
  notes?: string
) {
  return alphaTesterRequest(
    `/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    },
    adminPass
  );
}

export function sendAlphaTesterLink(id: string, adminPass: string, notes?: string) {
  return alphaTesterRequest(
    `/${encodeURIComponent(id)}/send-link`,
    {
      method: "POST",
      body: JSON.stringify({ notes }),
    },
    adminPass
  );
}
