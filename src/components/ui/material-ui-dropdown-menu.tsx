"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Ripple ---------- */
const MINIMUM_PRESS_MS = 300;
type RippleVariant = "trigger" | "item";

function useInternalRipple({ disabled = false, variant = "item" as RippleVariant } = {}) {
  const [pressed, setPressed] = React.useState(false);
  const surfaceRef = React.useRef<HTMLElement | null>(null);
  const rippleRef = React.useRef<HTMLSpanElement | null>(null);
  const growAnimationRef = React.useRef<Animation | null>(null);
  const mounted = React.useRef(true);

  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const start = (event?: React.PointerEvent | React.KeyboardEvent) => {
    if (disabled || !surfaceRef.current || !rippleRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    setPressed(true);
    growAnimationRef.current?.cancel();

    let cx = rect.width / 2, cy = rect.height / 2;
    if (event && "clientX" in event) {
      cx = (event as React.PointerEvent).clientX - rect.left;
      cy = (event as React.PointerEvent).clientY - rect.top;
    }

    if (variant === "trigger") {
      const maxDist = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(rect.width - cx, cy),
        Math.hypot(cx, rect.height - cy),
        Math.hypot(rect.width - cx, rect.height - cy),
      );
      const finalRadius = maxDist / 0.65;
      const finalSize = finalRadius * 2;
      const initialScale = Math.min(10 / finalSize, 0.04);
      const duration = Math.min(Math.max(600, Math.sqrt(rect.width * rect.height) * 3), 1000);

      rippleRef.current.style.width = `${finalSize}px`;
      rippleRef.current.style.height = `${finalSize}px`;

      const left = cx - finalRadius;
      const top = cy - finalRadius;
      const centerLeft = (rect.width - finalSize) / 2;
      const centerTop = (rect.height - finalSize) / 2;

      growAnimationRef.current = rippleRef.current.animate(
        [
          { transform: `translate(${left}px, ${top}px) scale(${initialScale})` },
          { transform: `translate(${centerLeft}px, ${centerTop}px) scale(1)` },
        ],
        { duration, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );
    } else {
      const maxDim = Math.max(rect.width, rect.height);
      const softEdge = Math.max(0.35 * maxDim, 75);
      const initialSize = Math.max(2, Math.floor(maxDim * 0.2));
      const hyp = Math.hypot(rect.width, rect.height);
      const maxRadius = hyp + 10;
      const duration = Math.min(Math.max(400, hyp * 1.5), 1000);
      const scale = (maxRadius + softEdge) / initialSize;

      rippleRef.current.style.width = `${initialSize}px`;
      rippleRef.current.style.height = `${initialSize}px`;

      const sx = cx - initialSize / 2;
      const sy = cy - initialSize / 2;
      const ex = (rect.width - initialSize) / 2;
      const ey = (rect.height - initialSize) / 2;

      growAnimationRef.current = rippleRef.current.animate(
        [
          { transform: `translate(${sx}px, ${sy}px) scale(1)` },
          { transform: `translate(${ex}px, ${ey}px) scale(${scale})` },
        ],
        { duration, easing: "cubic-bezier(0.2, 0, 0, 1)", fill: "forwards" },
      );
    }
  };

  const end = async () => {
    const a = growAnimationRef.current;
    if (a && typeof a.currentTime === "number" && (a.currentTime as number) < MINIMUM_PRESS_MS) {
      await new Promise((r) => setTimeout(r, MINIMUM_PRESS_MS - (a.currentTime as number)));
    }
    if (mounted.current) setPressed(false);
  };

  return {
    surfaceRef,
    rippleRef,
    pressed,
    events: {
      onPointerDown: (e: React.PointerEvent) => { if (e.button === 0) start(e); },
      onPointerUp: end,
      onPointerLeave: end,
      onPointerCancel: end,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          start(e);
          setTimeout(end, MINIMUM_PRESS_MS);
        }
      },
    },
  };
}

const RippleLayer = React.forwardRef<HTMLSpanElement, { pressed: boolean; variant?: RippleVariant }>(
  ({ pressed, variant = "item" }, ref) => (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        variant === "trigger" ? "rounded-[inherit]" : "",
      )}
    >
      <span
        ref={ref}
        className={cn(
          "absolute rounded-full transition-opacity duration-300",
          variant === "trigger" ? "bg-ink/10" : "bg-ink/12",
        )}
        style={{ opacity: pressed ? 1 : 0 }}
      />
    </span>
  ),
);
RippleLayer.displayName = "RippleLayer";

/* ---------- Cinematic styles ---------- */
const M3Styles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
@media (prefers-reduced-motion: no-preference) {
  @keyframes m3-sweep-down { 0% { clip-path: inset(0 0 100% 0 round var(--m3-menu-radius,12px)); } 100% { clip-path: inset(0 0 0 0 round var(--m3-menu-radius,12px)); } }
  @keyframes m3-sweep-up   { 0% { clip-path: inset(100% 0 0 0 round var(--m3-menu-radius,12px)); } 100% { clip-path: inset(0 0 0 0 round var(--m3-menu-radius,12px)); } }
  @keyframes m3-sweep-out-up   { 0% { clip-path: inset(0 0 0 0 round var(--m3-menu-radius,12px)); opacity:1; } 100% { clip-path: inset(0 0 100% 0 round var(--m3-menu-radius,12px)); opacity:0; } }
  @keyframes m3-sweep-out-down { 0% { clip-path: inset(0 0 0 0 round var(--m3-menu-radius,12px)); opacity:1; } 100% { clip-path: inset(100% 0 0 0 round var(--m3-menu-radius,12px)); opacity:0; } }
  @keyframes m3-item-cinematic { 0% { opacity:0; transform: translateY(8px) scale(0.98); } 100% { opacity:1; transform: translateY(0) scale(1); } }
  @keyframes m3-item-exit      { 0% { opacity:1; transform: translateY(0) scale(1); } 100% { opacity:0; transform: translateY(4px) scale(0.95); } }

  .m3-content[data-state="open"][data-side="bottom"] { animation: m3-sweep-down 400ms cubic-bezier(0.1,0.8,0.2,1) forwards; }
  .m3-content[data-state="open"][data-side="top"]    { animation: m3-sweep-up 400ms cubic-bezier(0.1,0.8,0.2,1) forwards; }
  .m3-content[data-state="closed"][data-side="bottom"] { animation: m3-sweep-out-up 240ms cubic-bezier(0.4,0,1,1) forwards; }
  .m3-content[data-state="closed"][data-side="top"]    { animation: m3-sweep-out-down 240ms cubic-bezier(0.4,0,1,1) forwards; }

  .m3-content[data-state="open"] .m3-item-enter { opacity:0; animation: m3-item-cinematic 350ms cubic-bezier(0.1,0.8,0.2,1) forwards; animation-delay: calc(var(--m3-stagger,0) * 30ms + 40ms); }
  .m3-content[data-state="closed"] .m3-item-enter { animation: m3-item-exit 180ms cubic-bezier(0.4,0,1,1) forwards; }
}
`,
    }}
  />
);

/* ---------- Components ---------- */
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 8, children, style, ...props }, ref) => {
  const staggered = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement, {
        style: { ...(child.props as any).style, "--m3-stagger": index } as React.CSSProperties,
      });
    }
    return child;
  });

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "m3-content z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-line bg-popover p-1 text-popover-foreground shadow-lg",
          className,
        )}
        style={{ ["--m3-menu-radius" as any]: "16px", ...style }}
        {...props}
      >
        <M3Styles />
        {staggered}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    delayDuration?: number;
    enterAnimation?: boolean;
  }
>(({ className, inset, children, delayDuration = 200, enterAnimation = true, onSelect, ...props }, ref) => {
  const { surfaceRef, rippleRef, pressed, events } = useInternalRipple({
    disabled: props.disabled,
    variant: "item",
  });

  const handleSelect = (e: Event) => {
    const isKeyboard = (e as any).detail?.originalEvent?.type === "keydown";
    if (delayDuration > 0 && !isKeyboard) {
      e.preventDefault();
      setTimeout(() => onSelect?.(e), delayDuration);
    } else {
      onSelect?.(e);
    }
  };

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      onSelect={handleSelect}
      className={cn(
        "group relative flex cursor-pointer select-none items-stretch overflow-hidden rounded-xl outline-none transition-colors duration-200 hover:bg-surface-2 focus:bg-surface-2 data-[highlighted]:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        enterAnimation && "m3-item-enter",
        className,
      )}
      {...props}
    >
      <div
        {...(events as any)}
        ref={(node) => { (surfaceRef as any).current = node; }}
        className={cn("relative flex flex-1 items-center px-3 py-2.5 text-[13px] text-ink", inset && "pl-8")}
      >
        <RippleLayer ref={rippleRef} pressed={pressed} variant="item" />
        <span className="relative z-10 flex flex-1 items-center gap-2">{children}</span>
      </div>
    </DropdownMenuPrimitive.Item>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn(
      "m3-item-enter relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-surface-2 data-[disabled]:opacity-40",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "m3-item-enter relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-surface-2 data-[disabled]:opacity-40",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
};
