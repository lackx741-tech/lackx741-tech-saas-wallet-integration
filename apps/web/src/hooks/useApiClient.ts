const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useApiClient() {
  return {
    getConfig: () => apiFetch("/config"),
    planEip7702: (payload: unknown) =>
      apiFetch("/api/plan/eip7702", { method: "POST", body: JSON.stringify(payload) }),
    submitEip7702: (payload: unknown) =>
      apiFetch("/api/submit/eip7702", { method: "POST", body: JSON.stringify(payload) }),
    planPermit2Batch: (payload: unknown) =>
      apiFetch("/api/plan/permit2-batch", { method: "POST", body: JSON.stringify(payload) }),
    submitPermit2Batch: (payload: unknown) =>
      apiFetch("/api/submit/permit2-batch", { method: "POST", body: JSON.stringify(payload) }),
  };
}
