"use client";

import { useEffect, useRef, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  size: number;
}

export function GlowingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const posRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef<TrailPoint[]>([]);
  const animIdRef = useRef<number>(0);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);

      // Update cursor dot position
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
      }

      // Add trail point
      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        size: isPointer ? 8 : 5,
      });

      // Keep trail length
      if (trailRef.current.length > 28) {
        trailRef.current.shift();
      }

      // Detect pointer cursor on interactive elements
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const style = el ? window.getComputedStyle(el).cursor : "auto";
      setIsPointer(style === "pointer" || el?.tagName === "BUTTON" || el?.tagName === "A");
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    // Animation loop for trail
    function drawTrail() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const trail = trailRef.current;

      // Draw trail as connected dots with gradient
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const ratio = i / trail.length;

        // Fade each point
        trail[i].opacity = ratio * 0.85;

        if (i === 0) continue;

        const prev = trail[i - 1];

        // Draw glow line segment
        const grad = ctx!.createLinearGradient(prev.x, prev.y, t.x, t.y);
        grad.addColorStop(0, `rgba(249,102,171,${prev.opacity * 0.4})`);
        grad.addColorStop(1, `rgba(226,28,112,${t.opacity * 0.6})`);

        ctx!.beginPath();
        ctx!.moveTo(prev.x, prev.y);
        ctx!.lineTo(t.x, t.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = ratio * 4;
        ctx!.lineCap = "round";
        ctx!.shadowBlur = 12;
        ctx!.shadowColor = "#F966AB";
        ctx!.stroke();
        ctx!.shadowBlur = 0;
      }

      // Draw glowing dots along trail
      for (let i = 1; i < trail.length; i++) {
        const t = trail[i];
        const ratio = i / trail.length;
        const r = ratio * 3.5;

        ctx!.beginPath();
        ctx!.arc(t.x, t.y, r, 0, Math.PI * 2);

        const dotGrad = ctx!.createRadialGradient(t.x, t.y, 0, t.x, t.y, r);
        dotGrad.addColorStop(0, `rgba(255,200,230,${t.opacity * 0.9})`);
        dotGrad.addColorStop(0.5, `rgba(249,102,171,${t.opacity * 0.6})`);
        dotGrad.addColorStop(1, `rgba(226,28,112,0)`);

        ctx!.fillStyle = dotGrad;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = "#F966AB";
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      // Spider web micro burst at cursor tip (every few frames)
      const tip = trail[trail.length - 1];
      if (tip && Math.random() > 0.6) {
        const spokes = 5;
        for (let s = 0; s < spokes; s++) {
          const angle = (s / spokes) * Math.PI * 2 + Date.now() * 0.002;
          const len = 6 + Math.random() * 8;
          ctx!.beginPath();
          ctx!.moveTo(tip.x, tip.y);
          ctx!.lineTo(
            tip.x + Math.cos(angle) * len,
            tip.y + Math.sin(angle) * len,
          );
          ctx!.strokeStyle = `rgba(249,102,171,${0.15 + Math.random() * 0.2})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      animIdRef.current = requestAnimationFrame(drawTrail);
    }

    drawTrail();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(animIdRef.current);
    };
  }, [isPointer]);

  return (
    <>
      {/* Trail canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998 }}
      />

      {/* Outer glow ring */}
      <div
        ref={glowRef}
        className="fixed pointer-events-none transition-all"
        style={{
          zIndex: 9999,
          width: isPointer ? 48 : 40,
          height: isPointer ? 48 : 40,
          borderRadius: "50%",
          border: `1.5px solid rgba(249,102,171,${isVisible ? (isPointer ? 0.8 : 0.5) : 0})`,
          boxShadow: isPointer
            ? "0 0 16px rgba(249,102,171,0.5), 0 0 32px rgba(226,28,112,0.25)"
            : "0 0 10px rgba(249,102,171,0.3)",
          transform: "translate(-20px,-20px)",
          transition: "width 0.15s, height 0.15s, border-color 0.15s, box-shadow 0.15s, opacity 0.2s",
          opacity: isVisible ? 1 : 0,
          background: isPointer ? "rgba(226,28,112,0.06)" : "transparent",
        }}
      />

      {/* Inner dot */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 9999,
          width: isPointer ? 10 : 12,
          height: isPointer ? 10 : 12,
          borderRadius: "50%",
          background: isPointer
            ? "radial-gradient(circle, #fff 0%, #F966AB 60%, #E21C70 100%)"
            : "radial-gradient(circle, #fff 0%, #F966AB 50%, #E21C70 100%)",
          boxShadow: isPointer
            ? "0 0 12px #F966AB, 0 0 24px #E21C70, 0 0 40px rgba(226,28,112,0.4)"
            : "0 0 8px #F966AB, 0 0 16px rgba(249,102,171,0.5)",
          transform: "translate(-6px,-6px)",
          transition: "width 0.1s, height 0.1s, opacity 0.2s",
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
}
