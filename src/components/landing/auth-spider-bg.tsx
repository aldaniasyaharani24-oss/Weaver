"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function AuthSpiderBg() {
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
    const WC = isLight ? "rgba(226,28,112," : "rgba(249,102,171,";
    const BC = isLight
      ? ["rgba(249,102,171,","rgba(226,28,112,","rgba(255,150,200,"]
      : ["rgba(226,28,112,","rgba(249,102,171,","rgba(174,8,73,"];

    // Nodes for web
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    }));

    // Bubbles — opacity jauh lebih tinggi di light mode
    const bubbles = Array.from({ length: 18 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: 20 + Math.random() * 55,
      op: isLight ? 0.16 + Math.random() * 0.2 : 0.05 + Math.random() * 0.08,
      color: BC[Math.floor(Math.random() * BC.length)],
    }));

    // Spider (bottom-right corner, climbing)
    const spider = { x: W * 0.85, y: H * 0.5, legPhase: 0, vy: -0.4 };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    function drawSpider(x: number, y: number, s: number, phase: number) {
      // Body
      const bg = ctx!.createRadialGradient(x, y, 0, x, y, s * 0.7);
      bg.addColorStop(0, isLight ? "rgba(174,8,73,0.95)" : "rgba(249,102,171,0.9)");
      bg.addColorStop(1, "rgba(174,8,73,0.6)");
      ctx!.beginPath(); ctx!.arc(x, y, s * 0.7, 0, Math.PI * 2);
      ctx!.fillStyle = bg; ctx!.fill();
      // Head
      ctx!.beginPath(); ctx!.arc(x, y - s * 0.9, s * 0.45, 0, Math.PI * 2);
      ctx!.fillStyle = isLight ? "rgba(226,28,112,0.9)" : "rgba(226,28,112,0.85)";
      ctx!.fill();
      // Eyes
      [-0.15, 0.15].forEach(ex => {
        ctx!.beginPath(); ctx!.arc(x + ex * s, y - s * 0.95, s * 0.12, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255,255,255,0.95)";
        ctx!.shadowBlur = 5; ctx!.shadowColor = "#E21C70";
        ctx!.fill(); ctx!.shadowBlur = 0;
      });
      // Legs
      [[-0.5,-0.4],[-0.7,-0.1],[-0.7,0.2],[-0.5,0.5],[0.5,-0.4],[0.7,-0.1],[0.7,0.2],[0.5,0.5]]
        .forEach(([lx, ly], i) => {
          const w = Math.sin(phase + i * 0.4) * 0.15;
          ctx!.beginPath();
          ctx!.moveTo(x + lx * s * 0.5, y + ly * s * 0.3);
          ctx!.quadraticCurveTo(x + lx * s * 0.9, y + (ly * 0.5 + w * 0.5) * s,
            x + lx * s * 1.6, y + (ly + w) * s * 1.6);
          ctx!.strokeStyle = isLight ? "rgba(174,8,73,0.65)" : "rgba(249,102,171,0.7)";
          ctx!.lineWidth = 1.5; ctx!.stroke();
        });
      // Thread upward
      ctx!.beginPath(); ctx!.moveTo(x, y + s * 0.7); ctx!.lineTo(x, y + s * 6);
      const tg = ctx!.createLinearGradient(x, y, x, y + s * 6);
      tg.addColorStop(0, isLight ? "rgba(174,8,73,0.6)" : "rgba(249,102,171,0.6)");
      tg.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.strokeStyle = tg; ctx!.lineWidth = 1; ctx!.stroke();
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Web lines — lebih terlihat di light
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 160) {
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `${WC}${(1 - d/160) * (isLight ? 0.38 : 0.17)})`;
            ctx!.lineWidth = isLight ? 1.0 : 0.7;
            ctx!.stroke();
          }
        }
      }

      // Node dots
      nodes.forEach(n => {
        ctx!.beginPath(); ctx!.arc(n.x, n.y, isLight ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = isLight ? "rgba(226,28,112,0.5)" : "rgba(249,102,171,0.25)";
        ctx!.fill();
      });

      // Bubbles
      bubbles.forEach(b => {
        const g = ctx!.createRadialGradient(b.x - b.r*.3, b.y - b.r*.3, b.r*.1, b.x, b.y, b.r);
        g.addColorStop(0, `${b.color}${b.op*2})`);
        g.addColorStop(0.6, `${b.color}${b.op})`);
        g.addColorStop(1, `${b.color}0)`);
        ctx!.beginPath(); ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx!.fillStyle = g; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(b.x - b.r*.3, b.y - b.r*.3, b.r*.25, 0, Math.PI * 2);
        ctx!.fillStyle = isLight ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)";
        ctx!.fill();
      });

      // Spider
      spider.legPhase += 0.04;
      spider.x = W * 0.85 + Math.sin(Date.now() * 0.0004) * 15;
      spider.y += spider.vy;
      if (spider.y < H * 0.1 || spider.y > H * 0.9) spider.vy *= -1;
      drawSpider(spider.x, spider.y, 13, spider.legPhase);

      // Move
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      bubbles.forEach(b => {
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
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
  );
}
