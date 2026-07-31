"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Bubble { x:number; y:number; vx:number; vy:number; r:number; opacity:number; color:string; }
interface SpiderNode { x:number; y:number; vx:number; vy:number; }

export function SpiderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId: number;

    const isLight = resolvedTheme === "light";

    // ── Color palette based on theme ──────────────────────────
    const BUBBLE_COLORS = isLight
      ? ["rgba(226,28,112,", "rgba(249,102,171,", "rgba(174,8,73,", "rgba(255,150,200,", "rgba(255,100,171,"]
      : ["rgba(226,28,112,", "rgba(249,102,171,", "rgba(174,8,73,", "rgba(124,58,237,", "rgba(168,85,247,"];

    const WEB_COLOR   = isLight ? "rgba(226,28,112," : "rgba(249,102,171,";
    const NODE_COLOR  = isLight ? "rgba(226,28,112,0.3)" : "rgba(249,102,171,0.25)";
    const THREAD_TOP  = isLight ? "rgba(226,28,112,0.7)" : "rgba(249,102,171,0.7)";
    const THREAD_BOT  = isLight ? "rgba(226,28,112,0)" : "rgba(249,102,171,0)";
    const LEG_COLOR   = isLight ? "rgba(226,28,112,0.6)" : "rgba(249,102,171,0.7)";

    // ── Bubbles ───────────────────────────────────────────────
    const bubbles: Bubble[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: 18 + Math.random() * 65,
      // Light mode: opacity jauh lebih tinggi agar terlihat di background putih-pink
      opacity: isLight ? 0.18 + Math.random() * 0.22 : 0.05 + Math.random() * 0.09,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    }));

    // ── Web nodes ─────────────────────────────────────────────
    const nodes: SpiderNode[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
    }));

    // ── Spider 1 (top center) + Spider 2 (bottom right) ──────
    const spider  = { x: W * 0.5, y: H * 0.12, legPhase: 0 };
    const spider2 = { x: W * 0.88, y: H * 0.6, legPhase: 2, vy: -0.3 };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // ── Draw spider ───────────────────────────────────────────
    function drawSpider(x: number, y: number, size: number, phase: number) {
      // Body
      const bodyGrad = ctx!.createRadialGradient(x, y, 0, x, y, size * 0.7);
      bodyGrad.addColorStop(0, isLight ? "rgba(226,28,112,0.95)" : "rgba(249,102,171,0.9)");
      bodyGrad.addColorStop(1, isLight ? "rgba(174,8,73,0.7)" : "rgba(174,8,73,0.6)");
      ctx!.beginPath();
      ctx!.arc(x, y, size * 0.7, 0, Math.PI * 2);
      ctx!.fillStyle = bodyGrad;
      ctx!.fill();

      // Head
      ctx!.beginPath();
      ctx!.arc(x, y - size * 0.9, size * 0.45, 0, Math.PI * 2);
      ctx!.fillStyle = isLight ? "rgba(174,8,73,0.9)" : "rgba(226,28,112,0.85)";
      ctx!.fill();

      // Eyes
      [-0.15, 0.15].forEach((ex) => {
        ctx!.beginPath();
        ctx!.arc(x + ex * size, y - size * 0.95, size * 0.12, 0, Math.PI * 2);
        ctx!.fillStyle = isLight ? "rgba(255,255,255,0.95)" : "rgba(249,102,171,1)";
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = isLight ? "#E21C70" : "#F966AB";
        ctx!.fill();
        ctx!.shadowBlur = 0;
      });

      // 8 legs
      const legPairs = [
        [-0.5,-0.4],[-0.7,-0.1],[-0.7,0.2],[-0.5,0.5],
        [0.5,-0.4],[0.7,-0.1],[0.7,0.2],[0.5,0.5],
      ];
      legPairs.forEach(([lx, ly], i) => {
        const wave = Math.sin(phase + i * 0.4) * 0.15;
        const sx = x + lx * size * 1.6;
        const sy = y + (ly + wave) * size * 1.6;
        ctx!.beginPath();
        ctx!.moveTo(x + lx * size * 0.5, y + ly * size * 0.3);
        ctx!.quadraticCurveTo(x + lx * size * 0.9, y + (ly * 0.5 + wave * 0.5) * size, sx, sy);
        ctx!.strokeStyle = LEG_COLOR;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      });

      // Hanging thread
      ctx!.beginPath();
      ctx!.moveTo(x, y + size * 0.7);
      ctx!.lineTo(x, y + size * 5);
      const tg = ctx!.createLinearGradient(x, y + size * 0.7, x, y + size * 5);
      tg.addColorStop(0, THREAD_TOP);
      tg.addColorStop(1, THREAD_BOT);
      ctx!.strokeStyle = tg;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }

    // ── Main draw loop ────────────────────────────────────────
    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Web lines — lebih tebal dan lebih terlihat di light mode
      const maxDist = 165;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isLight ? 0.35 : 0.17);
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `${WEB_COLOR}${alpha})`;
            ctx!.lineWidth = isLight ? 1.0 : 0.7;
            ctx!.stroke();
          }
        }
      }

      // Node dots — lebih besar di light mode
      nodes.forEach((n) => {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, isLight ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = isLight ? "rgba(226,28,112,0.5)" : NODE_COLOR;
        ctx!.fill();
      });

      // Bubbles
      bubbles.forEach((b) => {
        const grad = ctx!.createRadialGradient(
          b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
          b.x, b.y, b.r
        );
        grad.addColorStop(0, `${b.color}${b.opacity * 2})`);
        grad.addColorStop(0.6, `${b.color}${b.opacity})`);
        grad.addColorStop(1, `${b.color}0)`);
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();
        // Bubble shine
        ctx!.beginPath();
        ctx!.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
        ctx!.fillStyle = isLight ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)";
        ctx!.fill();
      });

      // Spider 1 — top center, swinging
      spider.legPhase += 0.04;
      spider.x = W * 0.5 + Math.sin(Date.now() * 0.0003) * 30;
      drawSpider(spider.x, spider.y, isLight ? 18 : 14, spider.legPhase);

      // Spider 2 — bottom right, climbing up/down
      spider2.legPhase += 0.035;
      spider2.x = W * 0.88 + Math.sin(Date.now() * 0.0004) * 12;
      spider2.y += spider2.vy;
      if (spider2.y < H * 0.1 || spider2.y > H * 0.9) spider2.vy *= -1;
      drawSpider(spider2.x, spider2.y, isLight ? 14 : 11, spider2.legPhase);

      // Web burst at spider tip
      if (Math.random() > 0.6) {
        const spokes = 5;
        for (let s = 0; s < spokes; s++) {
          const angle = (s / spokes) * Math.PI * 2 + Date.now() * 0.002;
          const len = 6 + Math.random() * 8;
          ctx!.beginPath();
          ctx!.moveTo(spider.x, spider.y + 14 * 0.7);
          ctx!.lineTo(spider.x + Math.cos(angle) * len, spider.y + 14 * 0.7 + Math.sin(angle) * len);
          ctx!.strokeStyle = `${WEB_COLOR}${0.15 + Math.random() * 0.2})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      // Move bubbles
      bubbles.forEach((b) => {
        b.x += b.vx; b.y += b.vy;
        if (b.x - b.r < 0 || b.x + b.r > W) b.vx *= -1;
        if (b.y - b.r < 0 || b.y + b.r > H) b.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
