const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TOKEN_KEY = "hyperboard_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function adminFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Sends session cookies along
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed (${response.status})`;
    const error = new Error(errorMsg);
    (error as { status?: number }).status = response.status;
    throw error;
  }

  return data as T;
}
