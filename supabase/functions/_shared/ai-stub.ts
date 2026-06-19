import type { AiEnvelope, AiOperation, AiSource } from "../../../shared/ai-contracts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

export function optionsResponse() {
  return new Response("ok", { headers: corsHeaders });
}

export async function parseJsonRequest(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Expected application/json request body");
  }
  return request.json();
}

async function getAuthenticatedUserId(request: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = request.headers.get("authorization");

  if (!supabaseUrl || !anonKey || !authorization) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authorization, apikey: anonKey }
    });
    if (!response.ok) return null;
    const user = await response.json();
    return typeof user.id === "string" ? user.id : null;
  } catch {
    return null;
  }
}

export async function recordAiRun<T>(envelope: AiEnvelope<T>, userId: string | null) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey || !userId) {
    console.info("AI run metadata", envelope.metadata);
    return;
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/ai_runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        user_id: userId,
        operation: envelope.metadata.operation,
        source: envelope.metadata.source,
        policy_version: envelope.metadata.policyVersion,
        schema_version: envelope.metadata.schemaVersion,
        fallback_reason: envelope.metadata.fallbackReason ?? null
      })
    });
  } catch (error) {
    console.error("Unable to record AI run metadata", error);
  }
}

export async function handleStubRequest<Input, Output>(
  request: Request,
  operation: AiOperation,
  parse: (value: unknown) => { success: true; data: Input } | { success: false; error: string },
  createDemo: (input: Input) => Output,
  validateOutput: (value: unknown) => value is Output,
  createEnvelope: (operation: AiOperation, data: Output, source?: AiSource, fallbackReason?: string) => AiEnvelope<Output>
) {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return jsonResponse(405, { error: "Method not allowed" });

  try {
    const rawInput = await parseJsonRequest(request);
    const parsed = parse(rawInput);
    if (!parsed.success) return jsonResponse(400, { error: parsed.error });

    const userId = await getAuthenticatedUserId(request);
    // TODO: Load only the authenticated user's permitted context.
    // TODO: Call OpenAI here with a versioned strict JSON Schema. Never expose its key to clients.
    const data = createDemo(parsed.data);
    if (!validateOutput(data)) return jsonResponse(500, { error: "Demo response failed runtime validation" });

    const envelope = createEnvelope(operation, data);
    await recordAiRun(envelope, userId);
    return jsonResponse(200, envelope);
  } catch (error) {
    console.error(`${operation} stub failed`, error);
    return jsonResponse(400, { error: "Invalid request" });
  }
}
