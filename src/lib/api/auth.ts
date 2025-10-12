import { getJson, withBase } from "./webApiConfig";

export interface MeResponse {
  user?: { id: string; email?: string; name?: string } | null;
}

export async function fetchMe(): Promise<MeResponse> {
  try {
    return await getJson<MeResponse>(withBase("/api/me"));
  } catch (e) {
    return { user: null };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const me = await fetchMe();
  return !!me?.user?.id;
}
