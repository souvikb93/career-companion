const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL_API = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return json({ error: "Valid URL required", errorType: "invalid_url" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing", errorType: "service_config" }, 500);
    if (!FIRECRAWL_API_KEY) return json({ error: "FIRECRAWL_API_KEY missing", errorType: "service_config" }, 500);

    // 1. Try Firecrawl first
    let markdown = "";
    let firecrawlError = "";
    try {
      const scrapeRes = await fetch(`${FIRECRAWL_API}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
          waitFor: 1500,
          timeout: 20000,
        }),
        signal: AbortSignal.timeout(22000),
      });
      const scrapeData = await scrapeRes.json();
      if (scrapeRes.ok) {
        markdown = scrapeData?.data?.markdown ?? scrapeData?.markdown ?? "";
      } else {
        firecrawlError = JSON.stringify(scrapeData).slice(0, 200);
      }
    } catch (e) {
      firecrawlError = e instanceof Error ? e.message : String(e);
    }

    // 2. If Firecrawl failed or returned empty, try direct fetch as fallback
    if (!markdown) {
      try {
        markdown = await fetchDirectText(url);
      } catch (e) {
        const directError = e instanceof Error ? e.message : String(e);
        // Both strategies failed — return a meaningful error
        return json({
          error: `Could not read page. Firecrawl: ${firecrawlError || "empty"}. Direct: ${directError}`,
          errorType: "scrape_failed",
        }, 422);
      }
    }

    if (!markdown.trim()) {
      return json({ error: "No readable content extracted from page", errorType: "no_content" }, 422);
    }

    // 3. Extract structured job info via AI
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
              "Extract job posting details from the markdown. Be concise. If a field is unknown, return an empty string. For companyAddress: first look in the page markdown (often in footer, contact, or imprint). If not present, use your world knowledge of the company's HQ.",
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
                  location: { type: "string", description: "Job posting location (city / remote)" },
                  salary: { type: "string" },
                  description: { type: "string", description: "2-4 sentence summary of the role" },
                  companyAddress: { type: "string", description: "Company HQ postal address as single line: 'Street, Postal City, Country'. Empty if not confident." },
                },
                required: ["company", "role", "location", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_job" } },
      }),
      signal: AbortSignal.timeout(25000),
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) {
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 502;
      return json({ error: `AI extraction failed (${aiRes.status})`, errorType: "ai_failed", detail: aiData }, status);
    }
    const call = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    if (!args) return json({ error: "AI returned no structured data", errorType: "ai_failed" }, 502);
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return json({
      company: parsed.company || "",
      role: parsed.role || "",
      location: parsed.location || "",
      salary: parsed.salary || "",
      description: parsed.description || "",
      link: url,
      companyAddress: parsed.companyAddress || "",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg, errorType: "unexpected" }, 500);
  }
});

async function fetchDirectText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  const html = await res.text();
  return stripHtml(html).slice(0, 14000);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, "\n")
    .trim();
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
