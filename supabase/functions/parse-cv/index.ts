// Supabase Edge Function: parse-cv
// Server-side PDF/DOCX text extraction. Used as a fallback when the
// client-side pdfjs path fails (typically on older iOS WebKit, which
// is missing JS APIs that pdfjs-dist v5 depends on).
//
// Deploy:  supabase functions deploy parse-cv
//
// Body: multipart/form-data with field "file" (PDF or DOCX, <=5MB).
// Returns: { text: string }  or  { error: string }

import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function extractFromPdf(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

// Naive DOCX extractor: unzip the file in memory, read word/document.xml,
// strip tags. Sufficient for plain-text resume parsing.
async function extractFromDocx(bytes: Uint8Array): Promise<string> {
  // DOCX is a ZIP; use Deno's built-in ZIP via the `jsr:@zip-js/zip-js` lib.
  const { BlobReader, ZipReader, TextWriter } = await import(
    "https://deno.land/x/zipjs@v2.7.45/index.js"
  );
  const blob = new Blob([bytes]);
  const reader = new ZipReader(new BlobReader(blob));
  const entries = await reader.getEntries();
  const docEntry = entries.find((e: { filename: string }) => e.filename === "word/document.xml");
  if (!docEntry) {
    await reader.close();
    throw new Error("DOCX missing word/document.xml");
  }
  const xml = await docEntry.getData!(new TextWriter());
  await reader.close();
  // Strip tags, collapse whitespace
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "Missing 'file' field" }, 400);
    if (file.size > 5 * 1024 * 1024) return json({ error: "File too large (max 5MB)" }, 400);

    const buf = new Uint8Array(await file.arrayBuffer());
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    const text = isPdf ? await extractFromPdf(buf) : await extractFromDocx(buf);
    if (!text.trim()) return json({ error: "No text extracted" }, 422);

    return json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: `Extraction failed: ${msg}` }, 500);
  }
});
