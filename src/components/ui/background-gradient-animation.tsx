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
  firstColor = "255, 120, 80",
  secondColor = "255, 200, 130",
  thirdColor = "150, 180, 255",
  fourthColor = "230, 200, 255",
  fifthColor = "255, 230, 180",
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
    const tick = () => {
      if (interactiveRef.current) {
        cur.current.x += (tgt.current.x - cur.current.x) / 20;
        cur.current.y += (tgt.current.y - cur.current.y) / 20;
        interactiveRef.current.style.transform = `translate(${Math.round(cur.current.x)}px, ${Math.round(cur.current.y)}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [interactive]);

  const onMove = (e: React.MouseEvent) => {
    if (!interactiveRef.current) return;
    const r = interactiveRef.current.getBoundingClientRect();
    tgt.current.x = e.clientX - r.left;
    tgt.current.y = e.clientY - r.top;
  };

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
      onMouseMove={interactive ? onMove : undefined}
    >
      <style>{`
        @keyframes bga-1 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-10%, 10%) } }
        @keyframes bga-2 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(15%, -5%) } }
        @keyframes bga-3 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-15%, -10%) } }
        @keyframes bga-4 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(20%, 15%) } }
        @keyframes bga-5 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-20%, 5%) } }
        .bga-blob { position:absolute; width:var(--size); height:var(--size); border-radius:9999px; mix-blend-mode:var(--blending-value); filter: blur(60px); opacity:0.55; }
      `}</style>
      <div className={cn("absolute inset-0", className)}>
        <div className="bga-blob" style={{ background: `radial-gradient(circle, rgba(var(--first-color),0.45) 0%, rgba(var(--first-color),0) 60%)`, top: "-20%", left: "-10%", animation: "bga-1 22s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, rgba(var(--second-color),0.5) 0%, rgba(var(--second-color),0) 60%)`, top: "30%", left: "60%", animation: "bga-2 28s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, rgba(var(--third-color),0.5) 0%, rgba(var(--third-color),0) 60%)`, top: "60%", left: "-10%", animation: "bga-3 30s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, rgba(var(--fourth-color),0.45) 0%, rgba(var(--fourth-color),0) 60%)`, top: "10%", left: "30%", animation: "bga-4 26s ease-in-out infinite" }} />
        <div className="bga-blob" style={{ background: `radial-gradient(circle, rgba(var(--fifth-color),0.45) 0%, rgba(var(--fifth-color),0) 60%)`, top: "55%", left: "40%", animation: "bga-5 24s ease-in-out infinite" }} />
        {interactive && (
          <div ref={interactiveRef} className="bga-blob" style={{ background: `radial-gradient(circle, rgba(var(--first-color),0.4) 0%, rgba(var(--first-color),0) 60%)` }} />
        )}
      </div>
      {children}
    </div>
  );
}
