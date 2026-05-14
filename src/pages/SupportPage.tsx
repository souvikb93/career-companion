import { useState } from "react";
import { Mail, Phone, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { TRANSLATIONS } from "@/lib/translations";

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line/60 last:border-b-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left group"
      >
        <span className={cn("text-[14px] font-medium leading-snug transition-colors", open ? "text-brand" : "text-ink lg:group-hover:text-brand")}>
          {q}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-ink-muted shrink-0 mt-0.5 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-[13px] text-ink-muted leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { t, lang } = useT();
  const items = TRANSLATIONS[lang].faq.items as { q: string; a: string }[];

  return (
    <div className="w-full p-4 sm:p-8">
      <h1 className="display-2 mb-10">{t("faq.title")}</h1>

      <div className="max-w-2xl space-y-5">

        <div className="glass-card p-5">
          <h3 className="text-[15px] font-semibold text-ink mb-4">{t("faq.contactTitle")}</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-xl bg-surface-2 border border-line grid place-items-center shrink-0">
                <Mail className="h-4 w-4 text-ink-muted" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">{t("faq.emailLabel")}</p>
                <a
                  href="mailto:souvik.b@alumni.nid.edu"
                  className="text-[14px] font-medium text-ink hover:text-brand transition-colors"
                >
                  souvik.b@alumni.nid.edu
                </a>
              </div>
            </div>
            <div className="hidden sm:block w-px bg-line" />
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-xl bg-surface-2 border border-line grid place-items-center shrink-0">
                <Phone className="h-4 w-4 text-ink-muted" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">{t("faq.phoneLabel")}</p>
                <p className="text-[14px] font-medium text-ink">+49 162 801 1261</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          {items.map((item) => (
            <AccordionItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

      </div>
    </div>
  );
}
