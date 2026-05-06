import { Download, ChevronDown } from "lucide-react";
import { ExportFormat } from "@/lib/exporters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/material-ui-dropdown-menu";

interface Props { onExport: (format: ExportFormat) => void }

const OPTIONS: { f: ExportFormat; label: string }[] = [
  { f: "pdf", label: "PDF (.pdf)" },
  { f: "docx", label: "Word (.docx)" },
  { f: "txt", label: "Plain text (.txt)" },
];

export function ExportMenu({ onExport }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-surface-2 outline-none">
        <Download className="h-4 w-4" /> Export <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {OPTIONS.map((o) => (
          <DropdownMenuItem key={o.f} onSelect={() => onExport(o.f)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
