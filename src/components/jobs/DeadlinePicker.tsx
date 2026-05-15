import { DatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { parseDate } from "@internationalized/date";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;           // "yyyy-MM-dd" or ""
  onChange: (val: string) => void;
  placeholder?: string;
  "aria-labelledby"?: string;
}

function toCalendarDate(iso: string) {
  try { return iso ? parseDate(iso) : undefined; } catch { return undefined; }
}

export function DeadlinePicker({ value, onChange, placeholder = "Pick a date", "aria-labelledby": ariaLabelledby }: Props) {
  const calVal = toCalendarDate(value);

  return (
    <DatePicker.Root
      value={calVal ? [calVal] : []}
      onValueChange={({ value }) => onChange(value[0]?.toString() ?? "")}
      positioning={{ placement: "bottom-end", offset: { mainAxis: 8 } }}
      closeOnSelect
    >
      {/* Trigger — matches input-base style */}
      <DatePicker.Control>
        <DatePicker.Trigger asChild>
          <button
            type="button"
            aria-labelledby={ariaLabelledby}
          className={cn("field-trigger", !value && "text-ink-muted/60")}
          >
            <span>{value
              ? new Date(value + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
              : placeholder}
            </span>
            <CalendarDays className="h-4 w-4 text-ink-muted shrink-0" />
          </button>
        </DatePicker.Trigger>
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content className={cn(
            "z-[200] w-[288px] rounded-2xl p-3",
            "border border-white/60 bg-white/70 backdrop-blur-2xl shadow-lg",
            "dark:border-white/10 dark:bg-[hsl(var(--surface)/0.85)]",
            "animate-in fade-in zoom-in-95 duration-150 origin-top",
          )}>

            {/* ── Day view ── */}
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <DatePicker.PrevTrigger className="h-7 w-7 rounded-full grid place-items-center opacity-60 hover:opacity-100 hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all">
                        <ChevronLeft className="h-4 w-4 text-ink" />
                      </DatePicker.PrevTrigger>

                      {/* Click → zoom out to month view */}
                      <DatePicker.ViewTrigger className="text-[14px] font-semibold text-ink hover:text-brand transition-colors cursor-pointer px-2 py-0.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>

                      <DatePicker.NextTrigger className="h-7 w-7 rounded-full grid place-items-center opacity-60 hover:opacity-100 hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all">
                        <ChevronRight className="h-4 w-4 text-ink" />
                      </DatePicker.NextTrigger>
                    </div>

                    <DatePicker.Table className="w-full border-collapse">
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {api.weekDays.map((d, i) => (
                            <DatePicker.TableHeader key={i} className="pb-2 text-[11px] font-medium text-ink-muted uppercase tracking-wide text-center w-9">
                              {d.short}
                            </DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {api.weeks.map((week, i) => (
                          <DatePicker.TableRow key={i}>
                            {week.map((day, j) => (
                              <DatePicker.TableCell key={j} value={day}>
                                <DatePicker.TableCellTrigger className={cn(
                                  "h-9 w-9 text-[13px] rounded-full grid place-items-center transition-colors",
                                  "hover:bg-black/[0.06] dark:hover:bg-white/10",
                                  "data-[selected]:bg-brand data-[selected]:text-white data-[selected]:hover:bg-brand",
                                  "data-[today]:ring-1 data-[today]:ring-brand/50 data-[today]:text-brand data-[today]:font-semibold data-[today]:data-[selected]:text-white data-[today]:data-[selected]:ring-0",
                                  "data-[outside-range]:opacity-30 data-[disabled]:opacity-30 data-[disabled]:cursor-not-allowed",
                                )}>
                                  {day.day}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>

            {/* ── Month view ── */}
            <DatePicker.View view="month">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <DatePicker.PrevTrigger className="h-7 w-7 rounded-full grid place-items-center opacity-60 hover:opacity-100 hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all">
                        <ChevronLeft className="h-4 w-4 text-ink" />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="text-[14px] font-semibold text-ink hover:text-brand transition-colors cursor-pointer px-2 py-0.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="h-7 w-7 rounded-full grid place-items-center opacity-60 hover:opacity-100 hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all">
                        <ChevronRight className="h-4 w-4 text-ink" />
                      </DatePicker.NextTrigger>
                    </div>

                    <DatePicker.Table className="w-full border-collapse">
                      <DatePicker.TableBody>
                        {api.getMonthsGrid({ columns: 3, format: "short" }).map((row, i) => (
                          <DatePicker.TableRow key={i} className="mb-1">
                            {row.map((month, j) => (
                              <DatePicker.TableCell key={j} value={month.value}>
                                <DatePicker.TableCellTrigger className={cn(
                                  "w-full py-2 text-[13px] font-medium rounded-xl text-center transition-colors",
                                  "hover:bg-black/[0.06] dark:hover:bg-white/10 text-ink",
                                  "data-[selected]:bg-brand data-[selected]:text-white data-[selected]:hover:bg-brand",
                                )}>
                                  {month.label}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>

            {/* ── Year view ── */}
            <DatePicker.View view="year">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <DatePicker.PrevTrigger className="h-7 w-7 rounded-full grid place-items-center opacity-60 hover:opacity-100 hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all">
                        <ChevronLeft className="h-4 w-4 text-ink" />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="text-[14px] font-semibold text-ink px-2 py-0.5 rounded-lg cursor-default">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="h-7 w-7 rounded-full grid place-items-center opacity-60 hover:opacity-100 hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all">
                        <ChevronRight className="h-4 w-4 text-ink" />
                      </DatePicker.NextTrigger>
                    </div>

                    <DatePicker.Table className="w-full border-collapse">
                      <DatePicker.TableBody>
                        {api.getYearsGrid({ columns: 4 }).map((row, i) => (
                          <DatePicker.TableRow key={i} className="mb-1">
                            {row.map((year, j) => (
                              <DatePicker.TableCell key={j} value={year.value}>
                                <DatePicker.TableCellTrigger className={cn(
                                  "w-full py-2 text-[13px] font-medium rounded-xl text-center transition-colors",
                                  "hover:bg-black/[0.06] dark:hover:bg-white/10 text-ink",
                                  "data-[selected]:bg-brand data-[selected]:text-white data-[selected]:hover:bg-brand",
                                )}>
                                  {year.label}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>

          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
}
