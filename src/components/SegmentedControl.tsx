import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: [Option<T>, Option<T>];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  const activeIndex = options[0].value === value ? 0 : 1;

  return (
    <div
      role="tablist"
      className={cn("relative flex h-11 rounded-full bg-black/[0.06] segmented-track p-1", className)}
    >
      {/* Sliding thumb — transform only, no layout reflow */}
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm pointer-events-none"
        style={{
          left: 4,
          width: "calc(50% - 4px)",
          transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
          transform: activeIndex === 0 ? "translateX(0)" : "translateX(calc(100% + 8px))",
        }}
      />

      {options.map((opt, i) => (
        <button
          key={opt.value}
          role="tab"
          type="button"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          style={{ touchAction: "manipulation" }}
          className={cn(
            "relative z-10 flex-1 rounded-full text-[14px] transition-colors duration-150 cursor-pointer select-none",
            value === opt.value
              ? "font-semibold text-ink segmented-tab-active"
              : "font-medium text-ink-muted hover:text-ink"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
