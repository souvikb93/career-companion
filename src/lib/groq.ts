import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function sanitizeJson(raw: string): string {
  // Replace literal control characters inside JSON string values with safe equivalents.
  // Walk char by char tracking whether we're inside a string.
  let result = "";
  let inString = false;
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (inString) {
      if (ch === "\\") {
        result += ch + (raw[i + 1] ?? "");
        i += 2;
        continue;
      }
      if (ch === '"') {
        inString = false;
        result += ch;
      } else if (ch === "\n") {
        result += "\\n";
      } else if (ch === "\r") {
        result += "\\r";
      } else if (ch === "\t") {
        result += "\\t";
      } else {
        result += ch;
      }
    } else {
      if (ch === '"') inString = true;
      result += ch;
    }
    i++;
  }
  return result;
}
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
function getModel() {
  try { return localStorage.getItem("tracka_ai_model") || DEFAULT_MODEL; } catch { return DEFAULT_MODEL; }
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function groqChat(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number },
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("Groq API key not configured");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ||
        `Groq API error (${res.status})`,
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function tailorResume(
  cv: {
    fullName: string;
    title: string;
    summary: string;
    experiences: { title: string; company: string; description: string }[];
    skills: string[];
    customInstructions?: string;
  },
  jobDescription: string,
): Promise<{ summary: string; skills: string[]; experiences: { title: string; description: string }[] }> {
  const prompt = `You are a professional resume writer. Given the candidate's current resume data and a job description, tailor the resume to better match the job.

CURRENT RESUME:
Name: ${cv.fullName}
Title: ${cv.title}
Summary: ${cv.summary}
Skills: ${cv.skills.join(", ")}
Experience:
${cv.experiences.map((e) => `- ${e.title} at ${e.company}: ${e.description}`).join("\n")}${cv.customInstructions ? `\n\nCANDIDATE INSTRUCTIONS (always follow these):\n${cv.customInstructions}` : ""}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with these fields:
- "summary": A tailored 2-3 sentence professional summary (single line, no newlines inside the string)
- "skills": An array of skill strings (keep existing relevant skills, add new relevant ones, max 8)
- "experiences": An array of objects with "title" (original job title) and "description" (2-3 bullet points as a single string separated by the literal characters backslash-n, no actual newlines inside the JSON string value)

IMPORTANT: Return ONLY valid JSON. No markdown fences, no explanation. All string values must be on one line with no raw newline characters inside them.`;

  const result = await groqChat(
    [{ role: "user", content: prompt }],
    { temperature: 0.6, max_tokens: 2048 },
  );

  const cleaned = result
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(sanitizeJson(cleaned));
}

export interface ScrapedJob {
  company: string;
  role: string;
  location: string;
  salary: string;
  description: string;
  link: string;
  companyAddress: string;
}

export async function scrapeJobFromUrl(url: string): Promise<ScrapedJob> {
  const isBlocked = /linkedin\.com|indeed\.com|glassdoor\.com/i.test(url);
  if (isBlocked) {
    throw new Error(
      "LinkedIn, Indeed and Glassdoor block automated scraping. Please copy the job description text and paste it in the text box below instead.",
    );
  }

  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Failed to fetch page (${res.status})`);

  const html = await res.text();
  // Strip tags and collapse whitespace to get readable text
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 12000);

  const prompt = `Extract structured job posting details from the following webpage text. Return ONLY a valid JSON object with these fields (all strings, no nulls):
- "company": the company name
- "role": the job title
- "location": city/remote info for THIS job posting
- "salary": salary range if mentioned, otherwise empty string
- "description": a 3-5 sentence summary of the role and requirements
- "companyAddress": the company's headquarters or main office postal address. First check the webpage (often in footer, contact page, or imprint). If not on the page, use your world knowledge of the company. Format as a single line: "Street, Postal City, Country". Return empty string ONLY if you are not confident.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation, all strings on one line.

WEBPAGE TEXT:
${text}`;

  const result = await groqChat([{ role: "user", content: prompt }], {
    temperature: 0.2,
    max_tokens: 800,
  });

  const cleaned = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(sanitizeJson(cleaned));
  return {
    company: parsed.company || "",
    role: parsed.role || "",
    location: parsed.location || "",
    salary: parsed.salary || "",
    description: parsed.description || "",
    link: url,
    companyAddress: parsed.companyAddress || "",
  };
}

export async function parseJobFromText(text: string): Promise<ScrapedJob> {
  const prompt = `Extract structured job posting details from the following text. Return ONLY a valid JSON object with these fields (all strings, no nulls):
- "company": the company name
- "role": the job title
- "location": city/remote info for THIS job posting
- "salary": salary range if mentioned, otherwise empty string
- "description": a 3-5 sentence summary of the role and requirements
- "companyAddress": the company's headquarters or main office postal address. First check the text. If not present, use your world knowledge of the company. Format as a single line: "Street, Postal City, Country". Return empty string ONLY if you are not confident.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation, all strings on one line.

JOB TEXT:
${text.slice(0, 12000)}`;

  const result = await groqChat([{ role: "user", content: prompt }], {
    temperature: 0.2,
    max_tokens: 800,
  });

  const cleaned = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(sanitizeJson(cleaned));
  return {
    company: parsed.company || "",
    role: parsed.role || "",
    location: parsed.location || "",
    salary: parsed.salary || "",
    description: parsed.description || "",
    link: "",
    companyAddress: parsed.companyAddress || "",
  };
}

export async function lookupCompanyAddress(company: string): Promise<string> {
  if (!company.trim()) return "";
  const prompt = `What is the headquarters or main office postal address of "${company}"? Use your world knowledge. Format as a single line: "Street, Postal City, Country". Return ONLY the address with no quotes or explanation. If you are not confident, return the single word UNKNOWN.`;
  try {
    const result = await groqChat([{ role: "user", content: prompt }], { temperature: 0, max_tokens: 120 });
    const cleaned = result.trim().replace(/^["']|["']$/g, "");
    if (!cleaned || /^unknown$/i.test(cleaned)) return "";
    return cleaned;
  } catch {
    return "";
  }
}

export interface LetterContent {
  companyName: string;
  companyAddress: string[];
  senderName: string;
  senderAddress: string[];
  senderEmail: string;
  senderPhone: string;
  date: string;
  subject: string;
  salutation: string;
  body: string[];
  signoff: string;
}

export function letterContentToText(c: LetterContent): string {
  const left = [c.companyName, ...c.companyAddress].filter(Boolean);
  const right = [c.senderName, ...c.senderAddress, c.senderEmail, c.senderPhone].filter(Boolean);
  const head = Math.max(left.length, right.length);
  const headerLines: string[] = [];
  for (let i = 0; i < head; i++) {
    headerLines.push([left[i] ?? "", right[i] ?? ""].join("\t"));
  }
  return [
    headerLines.join("\n"),
    "",
    c.date,
    "",
    c.subject,
    "",
    c.salutation,
    "",
    c.body.join("\n\n"),
    "",
    c.signoff,
    c.senderName,
  ].filter((s) => s !== undefined).join("\n");
}

export async function generateCoverLetter(
  cv: {
    fullName: string;
    title: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    summary: string;
    experiences: { title: string; company: string; description: string }[];
    skills: string[];
    customInstructions?: string;
  },
  jobDescription: string,
  companyName: string,
  roleName: string,
  companyLocation?: string,
  options?: { tone?: string; emphasis?: string },
): Promise<LetterContent> {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const companyAddressLines = (companyLocation || "").split(",").map((s) => s.trim()).filter(Boolean);
  const senderAddressLines = (cv.location || "").split(",").map((s) => s.trim()).filter(Boolean);

  const prompt = `You are a professional cover letter writer. Return ONLY a valid JSON object matching the schema below — no markdown, no commentary, no code fences.

Schema:
{
  "companyName": string,           // company on the left side
  "companyAddress": string[],      // company HQ address lines (max 3, use the provided lines)
  "senderName": string,            // candidate full name on the right
  "senderAddress": string[],       // candidate address lines (max 3)
  "senderEmail": string,
  "senderPhone": string,
  "date": string,                  // already provided, use as-is
  "subject": string,               // e.g. "Application for Senior Product Designer"
  "salutation": string,            // e.g. "Dear Hiring Team," — use a name only if in the job description
  "body": string[],                // 3 paragraphs as separate strings
  "signoff": string                // e.g. "Sincerely,"
}

Provided values (use these exactly, do NOT invent or replace them):
- companyName: "${companyName}"
- companyAddress: ${JSON.stringify(companyAddressLines)}
- senderName: "${cv.fullName}"
- senderAddress: ${JSON.stringify(senderAddressLines)}
- senderEmail: "${cv.email || ""}"
- senderPhone: "${cv.phone || ""}"
- date: "${today}"
- subject: "Application for ${roleName}"

CANDIDATE PROFILE:
Title: ${cv.title}
Summary: ${cv.summary}
Skills: ${cv.skills.join(", ")}
Recent Experience:
${cv.experiences.slice(0, 2).map((e) => `- ${e.title} at ${e.company}: ${e.description}`).join("\n")}${cv.customInstructions ? `\n\nCANDIDATE INSTRUCTIONS (always follow these):\n${cv.customInstructions}` : ""}

JOB DESCRIPTION: ${jobDescription}

Body paragraph guidance (exactly 3 paragraphs in the "body" array):
- Para 1 (80–120 words): name the role and company, state why this candidate is excited about THIS specific role at THIS specific company. Reference 2 concrete details from the job description.
- Para 2 (100–140 words): highlight 2–3 specific experiences or skills from the candidate profile that match the job's requirements. Tie each one to a measurable outcome or concrete example, not generic claims.
- Para 3 (80–110 words): cultural / values fit, why this candidate would thrive on the team, closing thought, invitation to talk further.

TOTAL body length must be 280–360 words. Do NOT pad with filler — every sentence should carry weight. Do not repeat the same point in two paragraphs.

Tone: ${options?.tone ?? "professional but warm"}. No fluff, no clichés like "I am writing to apply...". Do NOT invent facts. NEVER use bracketed placeholders like [Your Name] or [Date] — if a value is empty, leave that JSON field as an empty string or empty array. Return ONLY the JSON object.${options?.emphasis ? `\n\nEMPHASIS INSTRUCTION: The candidate specifically wants the letter to focus on: ${options.emphasis}. Weight the body paragraphs accordingly.` : ""}`;

  const raw = await groqChat(
    [{ role: "user", content: prompt }],
    { temperature: 0.7, max_tokens: 1500 },
  );
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(sanitizeJson(cleaned));
  return {
    companyName: parsed.companyName ?? companyName,
    companyAddress: Array.isArray(parsed.companyAddress) ? parsed.companyAddress : companyAddressLines,
    senderName: parsed.senderName ?? cv.fullName,
    senderAddress: Array.isArray(parsed.senderAddress) ? parsed.senderAddress : senderAddressLines,
    senderEmail: parsed.senderEmail ?? (cv.email || ""),
    senderPhone: parsed.senderPhone ?? (cv.phone || ""),
    date: parsed.date ?? today,
    subject: parsed.subject ?? `Application for ${roleName}`,
    salutation: parsed.salutation ?? "Dear Hiring Team,",
    body: Array.isArray(parsed.body) ? parsed.body : [String(parsed.body ?? "")],
    signoff: parsed.signoff ?? "Sincerely,",
  };
}

export async function editCoverLetter(
  currentLetter: LetterContent,
  userInstruction: string,
): Promise<LetterContent> {
  const prompt = `Here is a cover letter as a JSON object:

${JSON.stringify(currentLetter, null, 2)}

The user wants the following change: "${userInstruction}"

Apply the requested change and return the COMPLETE updated cover letter as the same JSON schema (companyName, companyAddress[], senderName, senderAddress[], senderEmail, senderPhone, date, subject, salutation, body[], signoff). Preserve all fields that don't need to change. Return ONLY the JSON object — no markdown, no commentary, no code fences.`;

  const raw = await groqChat(
    [{ role: "user", content: prompt }],
    { temperature: 0.6, max_tokens: 1500 },
  );
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(sanitizeJson(cleaned));
  return {
    companyName: parsed.companyName ?? currentLetter.companyName,
    companyAddress: Array.isArray(parsed.companyAddress) ? parsed.companyAddress : currentLetter.companyAddress,
    senderName: parsed.senderName ?? currentLetter.senderName,
    senderAddress: Array.isArray(parsed.senderAddress) ? parsed.senderAddress : currentLetter.senderAddress,
    senderEmail: parsed.senderEmail ?? currentLetter.senderEmail,
    senderPhone: parsed.senderPhone ?? currentLetter.senderPhone,
    date: parsed.date ?? currentLetter.date,
    subject: parsed.subject ?? currentLetter.subject,
    salutation: parsed.salutation ?? currentLetter.salutation,
    body: Array.isArray(parsed.body) ? parsed.body : currentLetter.body,
    signoff: parsed.signoff ?? currentLetter.signoff,
  };
}

// ── CV Parsing ─────────────────────────────────────────────────────────────

export interface ParsedProfile {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experiences: { id: string; title: string; company: string; start: string; end: string; description: string }[];
  education: { id: string; school: string; degree: string; field: string; date: string }[];
  customInstructions: string;
  avatarUrl?: string;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n");
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const text = await file.text();
  return text.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export async function parseCVFile(file: File): Promise<ParsedProfile> {
  let text = "";
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    text = await extractTextFromPDF(file);
  } else {
    text = await extractTextFromDOCX(file);
  }

  if (!text.trim()) throw new Error("Could not extract text from this file. Please try a different CV.");

  const uid = () => Math.random().toString(36).slice(2, 9);

  const prompt = `Extract structured profile information from this CV text. Return ONLY valid JSON with no markdown.

Required JSON structure:
{
  "fullName": "string",
  "title": "string (current job title or profession)",
  "email": "string",
  "phone": "string",
  "location": "string (city, country)",
  "linkedin": "string (LinkedIn URL if present)",
  "summary": "string (2-3 sentence professional summary, write one if not present)",
  "skills": ["string array, max 10"],
  "experiences": [
    { "title": "string", "company": "string", "start": "string (e.g. Jan 2020)", "end": "string (e.g. Mar 2023 or Present)", "description": "string (key achievements, 1-2 sentences)" }
  ],
  "education": [
    { "school": "string", "degree": "string", "field": "string", "date": "string (graduation year or date)" }
  ]
}

All string values must be on one line with no raw newline characters inside them.
If a field is not found, use empty string or empty array.

CV TEXT:
${text.slice(0, 12000)}`;

  const result = await groqChat([{ role: "user", content: prompt }], {
    temperature: 0.2,
    max_tokens: 3000,
  });

  const cleaned = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(sanitizeJson(cleaned));

  return {
    fullName: parsed.fullName || "",
    title: parsed.title || "",
    email: parsed.email || "",
    phone: parsed.phone || "",
    location: parsed.location || "",
    linkedin: parsed.linkedin || "",
    summary: parsed.summary || "",
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experiences: (parsed.experiences || []).map((e: Record<string, string>) => ({
      id: uid(),
      title: e.title || "",
      company: e.company || "",
      start: e.start || "",
      end: e.end || "",
      description: e.description || "",
    })),
    education: (parsed.education || []).map((e: Record<string, string>) => ({
      id: uid(),
      school: e.school || "",
      degree: e.degree || "",
      field: e.field || "",
      date: e.date || "",
    })),
  };
}
