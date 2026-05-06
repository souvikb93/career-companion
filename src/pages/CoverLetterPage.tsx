import { useEffect, useRef, useState } from "react";
import { Send, Download } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string }

const INITIAL_LETTER = `May 6, 2026

Hiring Team
Linear

Dear Hiring Team,

I'm writing to express my interest in the Senior Product Designer role at Linear. Your work on issue tracking has set the bar for craft and speed in modern software, and I'd love to contribute to that next chapter.

Over the past six years I've shipped consumer and B2B products end-to-end — from research and prototyping to design systems and launch. At Northstar I led a redesign of our core analytics surface that lifted weekly active retention by 18%, and built a system used across web and mobile.

I'd welcome the chance to talk about how I can help shape Linear's next surfaces.

Sincerely,
Jordan Doe`;

const INITIAL_MESSAGES: Message[] = [
  { role: "assistant", content: "Hi Jordan — I drafted a first version of your cover letter on the right. Want me to make it more concise, add specifics about a project, or adjust the tone?" },
];

export default function CoverLetterPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [letter, setLetter] = useState(INITIAL_LETTER);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Updated the letter with: "${text}". Take a look on the right and let me know what to refine next.` },
      ]);
      setLetter((prev) => prev + `\n\n[Edit reflecting: ${text}]`);
    }, 600);
  };

  return (
    <div className="w-full">
      <div className="px-8 py-5 flex items-center justify-between border-b border-line bg-surface">
        <div>
          <h1 className="text-[24px] font-semibold text-ink">Cover Letter Builder</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">Chat with AI to generate a customized cover letter.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 64px - 81px)" }}>
        {/* Chat */}
        <section className="bg-surface border-r border-line p-8 flex flex-col" style={{ maxHeight: "calc(100vh - 64px - 81px)" }}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-brand text-primary-foreground"
                      : "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-5 mt-5 border-t border-line">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask for a change..."
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={send}
                aria-label="Send"
                className="h-11 w-11 rounded-full bg-brand text-primary-foreground grid place-items-center transition-opacity duration-180 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[12px] text-ink-muted mt-2">
              Try: "Make it more formal" or "Add more about leadership"
            </p>
          </div>
        </section>

        {/* Preview */}
        <section className="bg-popover p-10 overflow-y-auto flex flex-col" style={{ maxHeight: "calc(100vh - 64px - 81px)" }}>
          <h2 className="text-[20px] font-semibold text-ink mb-6">Your cover letter</h2>
          <article className="flex-1 max-w-[640px] mx-auto w-full">
            <pre className="whitespace-pre-wrap font-sans text-[14px] text-ink leading-relaxed">{letter}</pre>
          </article>
          <div className="max-w-[640px] mx-auto w-full mt-8">
            <button
              type="button"
              className="w-full h-12 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-180 hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Save & Download
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
