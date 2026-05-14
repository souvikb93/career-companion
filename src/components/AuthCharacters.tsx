import { useEffect, useRef, useState } from "react";

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, isBlinking = false, forceLookX, forceLookY }: EyeBallProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const pos = (() => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  })();

  return (
    <div
      ref={ref}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: "white", overflow: "hidden" }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: "#151515",
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
}

function Pupil({ size = 12, maxDistance = 5, forceLookX, forceLookY }: { size?: number; maxDistance?: number; forceLookX?: number; forceLookY?: number }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const pos = (() => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  })();

  return (
    <div
      ref={ref}
      className="rounded-full"
      style={{ width: size, height: size, backgroundColor: "#151515", transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 0.1s ease-out" }}
    />
  );
}

export function AuthCharacters({ isTyping }: { isTyping?: boolean }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [purpleBlink, setPurpleBlink] = useState(false);
  const [blackBlink, setBlackBlink] = useState(false);
  const [lookEachOther, setLookEachOther] = useState(false);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const blink = (setter: (v: boolean) => void) => {
      const t = setTimeout(() => {
        setter(true);
        setTimeout(() => { setter(false); blink(setter); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t1 = blink(setPurpleBlink);
    const t2 = blink(setBlackBlink);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!isTyping) { setLookEachOther(false); return; }
    setLookEachOther(true);
    const t = setTimeout(() => setLookEachOther(false), 800);
    return () => clearTimeout(t);
  }, [isTyping]);

  const calcSkew = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 3;
    return {
      faceX: Math.max(-15, Math.min(15, (mouse.x - cx) / 20)),
      faceY: Math.max(-10, Math.min(10, (mouse.y - cy) / 30)),
      bodySkew: Math.max(-6, Math.min(6, -(mouse.x - cx) / 120)),
    };
  };

  const pp = calcSkew(purpleRef);
  const bp = calcSkew(blackRef);
  const yp = calcSkew(yellowRef);
  const op = calcSkew(orangeRef);

  return (
    <div className="relative" style={{ width: 480, height: 340 }}>
      <div
        ref={purpleRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 60, width: 160, height: isTyping ? 380 : 340,
          backgroundColor: "#FF5A2F",
          borderRadius: "10px 10px 0 0",
          zIndex: 1,
          transform: isTyping
            ? `skewX(${pp.bodySkew - 12}deg) translateX(36px)`
            : `skewX(${pp.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-7 transition-all duration-700"
          style={{
            left: lookEachOther ? 48 : 38 + pp.faceX,
            top: lookEachOther ? 58 : 36 + pp.faceY,
          }}
        >
          <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={purpleBlink}
            forceLookX={lookEachOther ? 3 : undefined} forceLookY={lookEachOther ? 4 : undefined} />
          <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={purpleBlink}
            forceLookX={lookEachOther ? 3 : undefined} forceLookY={lookEachOther ? 4 : undefined} />
        </div>
      </div>

      <div
        ref={blackRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 210, width: 110, height: 270,
          backgroundColor: "#151515",
          borderRadius: "8px 8px 0 0",
          zIndex: 2,
          transform: lookEachOther
            ? `skewX(${bp.bodySkew * 1.5 + 10}deg) translateX(18px)`
            : isTyping
              ? `skewX(${bp.bodySkew * 1.5}deg)`
              : `skewX(${bp.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-5 transition-all duration-700"
          style={{
            left: lookEachOther ? 28 : 22 + bp.faceX,
            top: lookEachOther ? 10 : 28 + bp.faceY,
          }}
        >
          <EyeBall size={16} pupilSize={6} maxDistance={4} isBlinking={blackBlink}
            forceLookX={lookEachOther ? 0 : undefined} forceLookY={lookEachOther ? -4 : undefined} />
          <EyeBall size={16} pupilSize={6} maxDistance={4} isBlinking={blackBlink}
            forceLookX={lookEachOther ? 0 : undefined} forceLookY={lookEachOther ? -4 : undefined} />
        </div>
      </div>

      <div
        ref={orangeRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 0, width: 210, height: 175,
          backgroundColor: "#E8E0D0",
          borderRadius: "105px 105px 0 0",
          zIndex: 3,
          transform: `skewX(${op.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-7 transition-all duration-200"
          style={{ left: 72 + op.faceX, top: 78 + op.faceY }}
        >
          <Pupil size={12} maxDistance={5} />
          <Pupil size={12} maxDistance={5} />
        </div>
      </div>

      <div
        ref={yellowRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 275, width: 130, height: 200,
          backgroundColor: "#A7A39B",
          borderRadius: "65px 65px 0 0",
          zIndex: 4,
          transform: `skewX(${yp.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-5 transition-all duration-200"
          style={{ left: 46 + yp.faceX, top: 36 + yp.faceY }}
        >
          <Pupil size={11} maxDistance={5} />
          <Pupil size={11} maxDistance={5} />
        </div>
        <div
          className="absolute rounded-full transition-all duration-200"
          style={{ width: 60, height: 4, backgroundColor: "#151515", left: 35 + yp.faceX, top: 80 + yp.faceY }}
        />
      </div>
    </div>
  );
}
