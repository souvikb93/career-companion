import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FIRECRAWL_API = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return json({ error: "Valid URL required" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);
    if (!FIRECRAWL_API_KEY) return json({ error: "FIRECRAWL_API_KEY missing" }, 500);

    // 1. Scrape page content via Firecrawl gateway
    const scrapeRes = await fetch(`${FIRECRAWL_GATEWAY}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIRECRAWL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    const scrapeData = await scrapeRes.json();
    if (!scrapeRes.ok) {
      return json({ error: `Scrape failed: ${JSON.stringify(scrapeData).slice(0, 300)}` }, 502);
    }
    const markdown: string =
      scrapeData?.data?.markdown ?? scrapeData?.markdown ?? "";
    if (!markdown) return json({ error: "No content extracted from page" }, 422);

    // 2. Extract structured job info via Lovable AI (tool call)
    const aiRes = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Extract job posting details from the markdown. Be concise. If a field is unknown, return an empty string.",
          },
          {
            role: "user",
            content: `URL: ${url}\n\nPAGE CONTENT (truncated):\n${markdown.slice(0, 12000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_job",
              description: "Save extracted job posting fields",
              parameters: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  role: { type: "string" },
                  location: { type: "string" },
                  salary: { type: "string" },
                  description: { type: "string", description: "2-4 sentence summary of the role" },
                },
                required: ["company", "role", "location", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_job" } },
      }),
    });
    const aiData = await aiRes.json();
    if (!aiRes.ok) {
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 502;
      return json({ error: `AI extraction failed (${aiRes.status})`, detail: aiData }, status);
    }
    const call = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    if (!args) return json({ error: "AI returned no structured data" }, 502);
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return json({
      company: parsed.company || "",
      role: parsed.role || "",
      location: parsed.location || "",
      salary: parsed.salary || "",
      description: parsed.description || "",
      link: url,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
