import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────── */

export type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

/* ── PhoneInput ───────────────────────────────────────────────── */

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, ...props }, ref) => (
  <RPNInput.default
    ref={ref}
    className={cn("phone-input-wrapper", className)}
    flagComponent={FlagComponent}
    countrySelectComponent={CountrySelect}
    inputComponent={PhoneNumberInput}
    onChange={(value) => onChange?.(value ?? ("" as RPNInput.Value))}
    {...props}
  />
));
PhoneInput.displayName = "PhoneInput";

/* ── Number input ─────────────────────────────────────────────── */

const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex-1 h-full px-3 bg-transparent text-[14px] text-ink",
      "placeholder:text-ink-muted/60 outline-none min-w-0",
      className,
    )}
    {...props}
  />
));
PhoneNumberInput.displayName = "PhoneNumberInput";

/* ── Country select ───────────────────────────────────────────── */

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({ disabled, value, onChange, options }: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Select country"
          className={cn(
            "flex items-center gap-1.5 h-full pl-3 pr-2.5 shrink-0",
            "border-r border-line/60 text-ink",
            "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
            "transition-colors duration-150 outline-none",
            "focus-visible:bg-surface-2",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          )}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown className="h-3.5 w-3.5 text-ink-muted shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[280px] p-0 rounded-2xl shadow-xl glass-popover border-0 overflow-hidden",
          "z-[70]",
        )}
        align="start"
        sideOffset={8}
      >
        <Command className="bg-transparent">
          <div className="border-b border-line/60">
            <CommandInput
              placeholder="Search country…"
              className="h-10 text-[14px] text-ink placeholder:text-ink-muted/60 bg-transparent"
            />
          </div>
          <CommandList>
            <ScrollArea className="h-64">
              <CommandEmpty className="py-4 text-center text-[13px] text-ink-muted">
                No country found.
              </CommandEmpty>
              <CommandGroup className="p-1.5">
                {options
                  .filter((o) => o.value)
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => { onChange(option.value); setOpen(false); }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer",
                        "text-[14px] text-ink",
                        "data-[selected=true]:bg-black/[0.05] dark:data-[selected=true]:bg-white/[0.06]",
                      )}
                    >
                      <FlagComponent country={option.value} countryName={option.label} />
                      <span className="flex-1 truncate">{option.label}</span>
                      <span className="text-[13px] text-ink-muted tabular-nums">
                        +{RPNInput.getCountryCallingCode(option.value)}
                      </span>
                      <CheckIcon
                        className={cn(
                          "h-3.5 w-3.5 text-brand shrink-0",
                          option.value === value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

/* ── Flag ─────────────────────────────────────────────────────── */

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-surface-2 shrink-0">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
