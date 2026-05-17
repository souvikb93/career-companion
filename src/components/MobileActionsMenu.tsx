import { useState } from "react";
import { MoreVertical, Save, FolderOpen, FilePlus, SlidersHorizontal, Download, Minus, Plus } from "lucide-react";
import { useT } from "@/lib/i18n";
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
  onLibrary: () => void;
  onCustomize?: () => void;
  onDownload?: () => void;
  zoom?: number;
  onZoom?: (z: number) => void;
}

export function MobileActionsMenu({ onNew, onSave, onLibrary, onCustomize, onDownload, zoom, onZoom }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const step = 0.1;
  const dec = () => onZoom && zoom !== undefined && onZoom(Math.max(0.3, Math.round((zoom - step) * 100) / 100));
  const inc = () => onZoom && zoom !== undefined && onZoom(Math.min(2.5, Math.round((zoom + step) * 100) / 100));

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="h-10 w-10 grid place-items-center rounded-xl text-ink hover:bg-black/5 transition-colors outline-none">
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {onNew && (
          <DropdownMenuItem onSelect={() => { onNew(); setOpen(false); }}>
            <FilePlus className="h-4 w-4 text-ink-muted" />
            {t("common.newDoc")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => { onSave(); setOpen(false); }}>
          <Save className="h-4 w-4 text-ink-muted" />
          {t("common.save")}
        </DropdownMenuItem>

        {onCustomize && (
          <DropdownMenuItem onSelect={() => { onCustomize(); setOpen(false); }}>
            <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
            {t("design.panelTitle")}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {onDownload && (
          <DropdownMenuItem onSelect={() => { onDownload(); setOpen(false); }}>
            <Download className="h-4 w-4 text-ink-muted" />
            {t("common.download")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => { onLibrary(); setOpen(false); }}>
          <FolderOpen className="h-4 w-4 text-ink-muted" />
          {t("common.library")}
        </DropdownMenuItem>

        {onZoom && zoom !== undefined && (
          <>
            <DropdownMenuSeparator />
            {/* Zoom row — plain div, does not close the dropdown */}
            <div className="px-2 py-2">
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide px-1 mb-2">
                Zoom
              </p>
              <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={dec}
                  aria-label={t("common.zoomOut")}
                  className="btn-icon-sm h-7 w-7"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="flex-1 text-center text-[12px] font-medium text-ink tabular-nums select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={inc}
                  aria-label={t("common.zoomIn")}
                  className="btn-icon-sm h-7 w-7"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
