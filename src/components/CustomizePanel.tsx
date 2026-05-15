import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStyle, DocTheme, DocDensity, DocSize, DocPage, DOC_THEMES_META, DOC_SIZES_META, DOC_DENSITIES_META, DOC_PAGE_META } from "@/lib/document-theme";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  style: DocumentStyle;
  onChange: (style: DocumentStyle) => void;
}

export function CustomizePanel({ open, onClose, style, onChange }: Props) {
  const { t } = useT();
  if (!open) return null;

  const set = <K extends keyof DocumentStyle>(key: K, val: DocumentStyle[K]) =>
    onChange({ ...style, [key]: val });

  const THEME_LABELS: Record<DocTheme, { name: string; desc: string }> = {
    classic:   { name: t("design.classic"),   desc: t("design.classicDesc") },
    editorial: { name: t("design.editorial"), desc: t("design.editorialDesc") },
    modern:    { name: t("design.modern"),    desc: t("design.modernDesc") },
    minimal:   { name: t("design.minimal"),   desc: t("design.minimalDesc") },
  };

  const SIZE_LABELS: Record<string, string> = {
    s: t("design.sizeS"),
    m: t("design.sizeM"),
    l: t("design.sizeL"),
  };

  const DENSITY_LABELS: Record<string, string> = {
    compact: t("design.compact"),
    normal:  t("design.normal"),
    relaxed: t("design.relaxed"),
  };

  const PAGE_LABELS: Record<DocPage, string> = {
    light: t("design.light"),
    dark:  t("design.dark"),
  };

  return (
    <>
      <div className="fixed inset-0 z-40 modal-backdrop animate-panel-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[320px] side-panel overflow-y-auto">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[20px] font-semibold text-ink leading-tight">{t("design.panelTitle")}</h2>
              <p className="text-[13px] text-ink-muted mt-1">{t("design.panelSubtitle")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Theme */}
          <section className="mb-8">
            <p className="eyebrow mb-3">{t("design.theme")}</p>
            <div className="grid grid-cols-2 gap-2">
              {DOC_THEMES_META.map((th) => {
                const active = style.theme === th.id;
                const { name, desc } = THEME_LABELS[th.id];
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => set("theme", th.id as DocTheme)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all duration-180 tile-surface",
                      active
                        ? "border-brand text-brand"
                        : "border-transparent text-ink hover:border-brand/25"
                    )}
                  >
                    <div
                      className="text-[18px] leading-tight mb-1.5"
                      style={{ fontFamily: th.fontPreview, color: "inherit" }}
                    >
                      Aa
                    </div>
                    <p className="text-[12px] font-semibold">{name}</p>
                    <p className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>{desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Size */}
          <section className="mb-8">
            <p className="eyebrow mb-3">{t("design.size")}</p>
            <div className="flex gap-2">
              {DOC_SIZES_META.map((s) => {
                const active = style.size === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set("size", s.id as DocSize)}
                    className={cn(
                      "flex-1 h-10 rounded-xl border text-[13px] font-medium transition-all duration-180 tile-surface",
                      active
                        ? "border-brand text-brand"
                        : "border-transparent text-ink-muted hover:border-brand/25 hover:text-ink"
                    )}
                  >
                    {SIZE_LABELS[s.id]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Density */}
          <section className="mb-8">
            <p className="eyebrow mb-3">{t("design.density")}</p>
            <div className="flex gap-2">
              {DOC_DENSITIES_META.map((d) => {
                const active = style.density === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => set("density", d.id as DocDensity)}
                    className={cn(
                      "flex-1 h-10 rounded-xl border text-[13px] font-medium transition-all duration-180 tile-surface",
                      active
                        ? "border-brand text-brand"
                        : "border-transparent text-ink-muted hover:border-brand/25 hover:text-ink"
                    )}
                  >
                    {DENSITY_LABELS[d.id]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Page Mode */}
          <section className="mb-8">
            <p className="eyebrow mb-3">{t("design.pageMode")}</p>
            <div className="grid grid-cols-2 gap-2">
              {DOC_PAGE_META.map((pg) => {
                const active = style.page === pg.id;
                const isLight = pg.id === "light";
                return (
                  <button
                    key={pg.id}
                    type="button"
                    onClick={() => set("page", pg.id as DocPage)}
                    className={cn(
                      "flex flex-col items-center justify-center h-[76px] rounded-2xl border-2 transition-all duration-180",
                      isLight ? "bg-white" : "bg-[#1c1a18]",
                      active
                        ? "border-brand"
                        : isLight ? "border-black/[0.08] hover:border-black/20" : "border-white/[0.08] hover:border-white/20"
                    )}
                  >
                    <span
                      className="text-[22px] font-semibold leading-none tracking-tight"
                      style={{ color: isLight ? "#1a1818" : "#f0ebe4" }}
                    >
                      Tt
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
