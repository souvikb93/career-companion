import { Download, ChevronDown, FileText, FileType, FileCode } from "lucide-react";
import { ExportFormat } from "@/lib/exporters";
import { useT } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/material-ui-dropdown-menu";

interface Props { onExport: (format: ExportFormat) => void }

export function ExportMenu({ onExport }: Props) {
  const { t } = useT();
  const OPTIONS: { f: ExportFormat; label: string; icon: typeof FileText }[] = [
    { f: "pdf", label: t("formats.pdf"), icon: FileText },
    { f: "docx", label: t("formats.docx"), icon: FileType },
    { f: "txt", label: t("formats.txt"), icon: FileCode },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="btn-ghost outline-none">
        <Download className="h-4 w-4" /> {t("common.export")} <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          return (
            <DropdownMenuItem key={o.f} onSelect={() => onExport(o.f)}>
              <Icon className="h-4 w-4 text-ink-muted mr-1" />
              {o.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
