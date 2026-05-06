"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  size?: string;
  blendingValue?: string;
  className?: string;
  containerClassName?: string;
  interactive?: boolean;
  children?: React.ReactNode;
}

export function BackgroundGradientAnimation({
  firstColor = "var(--brand)",
  secondColor = "42 72% 70%",
  thirdColor = "218 84% 74%",
  fourthColor = "281 65% 82%",
  fifthColor = "160 84% 39%",
  size = "70%",
  blendingValue = "normal",
  className,
  containerClassName,
  interactive = false,
  children,
}: Props) {
  const interactiveRef = useRef<HTMLDivElement | null>(null);
  const cur = useRef({ x: 0, y: 0 });
  const tgt = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!interactive) return;
    const handlePointerMove = (event: PointerEvent) => {
      tgt.current.x = event.clientX;
      tgt.current.y = event.clientY;
    };

    tgt.current.x = window.innerWidth / 2;
    tgt.current.y = window.innerHeight / 2;
    cur.current.x = tgt.current.x;
    cur.current.y = tgt.current.y;
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const tick = () => {
      if (interactiveRef.current) {
        cur.current.x += (tgt.current.x - cur.current.x) / 18;
        cur.current.y += (tgt.current.y - cur.current.y) / 18;
        interactiveRef.current.style.transform = `translate3d(${Math.round(cur.current.x)}px, ${Math.round(cur.current.y)}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [interactive]);

  const style: React.CSSProperties = {
    ["--first-color" as any]: firstColor,
    ["--second-color" as any]: secondColor,
    ["--third-color" as any]: thirdColor,
    ["--fourth-color" as any]: fourthColor,
    ["--fifth-color" as any]: fifthColor,
    ["--size" as any]: size,
    ["--blending-value" as any]: blendingValue,
  };

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", containerClassName)}
      style={style}
    >
      <style>{`
        @keyframes bga-1 { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(-10%, 9%,0) scale(1.08) } }
        @keyframes bga-2 { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(13%, -6%,0) scale(0.95) } }
        @keyframes bga-3 { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(-14%, -9%,0) scale(1.06) } }
        @keyframes bga-4 { 0%,100% { transform: translate3d(0,0,0) scale(0.98) } 50% { transform: translate3d(18%, 12%,0) scale(1.08) } }
        @keyframes bga-5 { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(-18%, 5%,0) scale(1.05) } }
        .bga-blob { position:absolute; width:var(--size); height:var(--size); border-radius:9999px; mix-blend-mode:var(--blending-value); filter: blur(70px); opacity:0.42; will-change:transform; }
        .bga-cursor { width:46vmax; height:46vmax; opacity:0.34; transition:opacity 180ms ease; }
        @media (prefers-reduced-motion: reduce) { .bga-blob { animation:none !important; } .bga-cursor { display:none; } }
      `}</style>
      <div className={cn("absolute inset-0", className)}>
        <div className="bga-blob" style={{ background: `radial-gradient(circle, hsl(var(--first-color) / 0.22) 0%, hsl(var(--first-color) / 0) 62%)`, top: "-20%", left: "-10%", animation: "bga-1 18s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, hsl(var(--second-color) / 0.18) 0%, hsl(var(--second-color) / 0) 62%)`, top: "30%", left: "60%", animation: "bga-2 22s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, hsl(var(--third-color) / 0.2) 0%, hsl(var(--third-color) / 0) 62%)`, top: "60%", left: "-10%", animation: "bga-3 24s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, hsl(var(--fourth-color) / 0.18) 0%, hsl(var(--fourth-color) / 0) 62%)`, top: "10%", left: "30%", animation: "bga-4 20s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, hsl(var(--fifth-color) / 0.14) 0%, hsl(var(--fifth-color) / 0) 62%)`, top: "55%", left: "40%", animation: "bga-5 21s ease-in-out infinite" }} />
        {interactive && (
          <div ref={interactiveRef} className="bga-blob bga-cursor" style={{ background: `radial-gradient(circle, hsl(var(--first-color) / 0.26) 0%, hsl(var(--second-color) / 0.12) 34%, hsl(var(--first-color) / 0) 66%)` }} />
        )}
      </div>
      {children}
    </div>
  );
}
