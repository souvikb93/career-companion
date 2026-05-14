import { useState } from "react";
import { MoreVertical, Save, LayoutTemplate, Download, FolderOpen, Check, FileText, FileType, FileCode, FilePlus } from "lucide-react";
import { useT } from "@/lib/i18n";
import { LayoutVariant } from "@/components/LayoutMenu";
import { ExportFormat } from "@/lib/exporters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/material-ui-dropdown-menu";

interface Props {
  onNew?: () => void;
  onSave: () => void;
  layout: LayoutVariant;
  onLayoutChange: (v: LayoutVariant) => void;
  onExport: (format: ExportFormat) => void;
  onLibrary: () => void;
}

export function MobileActionsMenu({ onNew, onSave, layout, onLayoutChange, onExport, onLibrary }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const LAYOUTS: { value: LayoutVariant; label: string }[] = [
    { value: "classic", label: t("layouts.classic") },
    { value: "modern", label: t("layouts.modern") },
    { value: "compact", label: t("layouts.compact") },
  ];

  const EXPORTS: { f: ExportFormat; label: string; icon: typeof FileText }[] = [
    { f: "pdf", label: t("formats.pdf"), icon: FileText },
    { f: "docx", label: t("formats.docx"), icon: FileType },
    { f: "txt", label: t("formats.txt"), icon: FileCode },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="h-10 w-10 grid place-items-center rounded-xl text-ink hover:bg-black/5 transition-colors outline-none">
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {onNew && (
          <DropdownMenuItem onSelect={() => { onNew(); setOpen(false); }}>
            <FilePlus className="h-4 w-4 text-ink-muted mr-2" />
            {t("common.newDoc")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => { onSave(); setOpen(false); }}>
          <Save className="h-4 w-4 text-ink-muted mr-2" />
          {t("common.save")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide px-1 mb-1">{t("common.layout")}</p>
          {LAYOUTS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => { onLayoutChange(opt.value); setOpen(false); }}
              className="flex items-center gap-2"
            >
              <Check className={"h-3.5 w-3.5 " + (layout === opt.value ? "opacity-100 text-brand" : "opacity-0")} />
              {opt.label}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide px-1 mb-1">{t("common.export")}</p>
          {EXPORTS.map((o) => {
            const Icon = o.icon;
            return (
              <DropdownMenuItem key={o.f} onSelect={() => { onExport(o.f); setOpen(false); }}>
                <Icon className="h-4 w-4 text-ink-muted mr-2" />
                {o.label}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => { onLibrary(); setOpen(false); }}>
          <FolderOpen className="h-4 w-4 text-ink-muted mr-2" />
          {t("common.library")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
