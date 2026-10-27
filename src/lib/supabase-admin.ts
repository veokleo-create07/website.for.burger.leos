import "server-only";

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

export async function supabaseRpc<T>(
  functionName: string,
  args: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  const config = getSupabaseConfig();
  if (!config) return { data: null, error: "not_configured" };

  try {
    const response = await fetch(config.url + "/rest/v1/rpc/" + functionName, {
      method: "POST",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: "Bearer " + config.serviceRoleKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      return { data: null, error: body || "supabase_request_failed" };
    }

    return { data: (await response.json()) as T, error: null };
  } catch {
    return { data: null, error: "supabase_request_failed" };
  }
}
