"use client";

import { useEffect, useRef } from "react";

type Node   = { x:number; y:number; vx:number; vy:number };
type Spider = { x:number; y:number; leg:number; size:number; vy:number };

// ── Draw helpers ─────────────────────────────────────────────────────────────
function drawStaticWeb(ctx: CanvasRenderingContext2D, W: number, H: number, light: boolean) {
  const cx = W / 2, cy = H / 2;
  const spokes = 12;
  const rings  = [60, 140, 240, 360, 490];
  // Light mode: opacity lebih tinggi agar kelihatan
  const baseA  = light ? 0.45 : 0.12;
  const color  = light ? "rgba(174,8,73," : "rgba(191,4,19,";

  for (let i = 0; i < spokes; i++) {
    const ang = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * 550, cy + Math.sin(ang) * 550);
    ctx.strokeStyle = `${color}${baseA * 0.75})`;
    ctx.lineWidth = light ? 1.5 : 0.5;
    ctx.stroke();
  }

  rings.forEach(r => {
    ctx.beginPath();
    for (let i = 0; i <= spokes; i++) {
      const ang = (i / spokes) * Math.PI * 2;
      const px = cx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `${color}${baseA})`;
    ctx.lineWidth = light ? 1.5 : 0.55;
    ctx.stroke();
  });
}

function drawSpider(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, leg: number, light: boolean
) {
  const bodyC   = light ? "rgba(174,8,73,0.95)"  : "rgba(191,4,19,0.95)";
  const headC   = light ? "rgba(226,28,112,0.92)" : "rgba(140,3,3,0.92)";
  const legC    = light ? "rgba(174,8,73,0.75)"   : "rgba(89,2,2,0.85)";
  const glow    = light ? "#E21C70" : "#BF0413";
  const threadC = light ? "rgba(174,8,73,0.6)"    : "rgba(191,4,19,0.6)";

  // Thread from top
  const tg = ctx.createLinearGradient(x, 0, x, y);
  tg.addColorStop(0, "rgba(0,0,0,0)");
  tg.addColorStop(1, threadC);
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y);
  ctx.strokeStyle = tg; ctx.lineWidth = 1.3; ctx.stroke();

  // Body
  ctx.beginPath(); ctx.arc(x, y, size * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = bodyC;
  ctx.shadowBlur = light ? 12 : 6;
  ctx.shadowColor = glow;
  ctx.fill(); ctx.shadowBlur = 0;

  // Head
  ctx.beginPath(); ctx.arc(x, y - size, size * 0.46, 0, Math.PI * 2);
  ctx.fillStyle = headC; ctx.fill();

  // Eyes
  [-0.18, 0.18].forEach(ex => {
    ctx.beginPath();
    ctx.arc(x + ex * size, y - size * 1.02, size * 0.13, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.97)";
    ctx.shadowBlur = 8; ctx.shadowColor = glow;
    ctx.fill(); ctx.shadowBlur = 0;
  });

  // 8 legs
  [[-0.5,-0.4],[-0.7,-0.05],[-0.65,0.3],[-0.45,0.65],
   [0.5,-0.4],[0.7,-0.05],[0.65,0.3],[0.45,0.65]].forEach(([lx, ly], i) => {
    const wave = Math.sin(leg + i * 0.45) * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + lx! * size * 0.5, y + ly! * size * 0.3);
    ctx.quadraticCurveTo(
      x + lx! * size, y + (ly! * 0.5 + wave) * size,
      x + lx! * size * 1.8, y + (ly! + wave * 1.3) * size * 1.6,
    );
    ctx.strokeStyle = legC; ctx.lineWidth = 1.8; ctx.stroke();
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export function WebCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId: number;

    const getLight = () => !document.documentElement.classList.contains("dark");

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Web nodes
    const nodes: Node[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
    }));

    // Spiders (3 buah)
    const spiders: Spider[] = [
      { x: W * 0.5,  y: H * 0.1,  leg: 0,   size: 16, vy: 0    },
      { x: W * 0.88, y: H * 0.5,  leg: 1.5, size: 13, vy: -0.3 },
      { x: W * 0.12, y: H * 0.65, leg: 3.0, size: 11, vy: 0.25 },
    ];

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      const light = getLight();
      const WC = light ? "rgba(226,28,112," : "rgba(191,4,19,";
      const t  = Date.now() * 0.001;

      // 1. Static web background
      drawStaticWeb(ctx!, W, H, light);

      // 2. Dynamic web lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 165) {
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            // Light: jauh lebih tebal & opaque
            ctx!.strokeStyle = `${WC}${(1 - d / 165) * (light ? 0.6 : 0.22)})`;
            ctx!.lineWidth = light ? 1.4 : 0.85;
            ctx!.stroke();
          }
        }
      }

      // Node dots
      nodes.forEach(n => {
        ctx!.beginPath(); ctx!.arc(n.x, n.y, light ? 3.0 : 2.0, 0, Math.PI * 2);
        ctx!.fillStyle = light ? "rgba(174,8,73,0.7)" : "rgba(191,4,19,0.45)";
        ctx!.fill();
      });

      // 3. Spider 0 — atas tengah, ayun
      spiders[0].leg += 0.045;
      spiders[0].x    = W * 0.5 + Math.sin(t * 0.3) * 40;
      spiders[0].y    = H * 0.08 + Math.abs(Math.sin(t * 0.18)) * 35;
      spiders[0].size = light ? 22 : 14;
      drawSpider(ctx!, spiders[0].x, spiders[0].y, spiders[0].size, spiders[0].leg, light);

      // Spider 1 — kanan, naik-turun
      spiders[1].leg += 0.038;
      spiders[1].x    = W * 0.88 + Math.cos(t * 0.22) * 15;
      spiders[1].y   += spiders[1].vy;
      if (spiders[1].y > H * 0.92 || spiders[1].y < H * 0.05) spiders[1].vy *= -1;
      spiders[1].size = light ? 18 : 11;
      drawSpider(ctx!, spiders[1].x, spiders[1].y, spiders[1].size, spiders[1].leg, light);

      // Spider 2 — kiri, naik-turun
      spiders[2].leg += 0.042;
      spiders[2].x    = W * 0.1 + Math.sin(t * 0.26) * 18;
      spiders[2].y   += spiders[2].vy;
      if (spiders[2].y > H * 0.9 || spiders[2].y < H * 0.05) spiders[2].vy *= -1;
      spiders[2].size = light ? 16 : 10;
      drawSpider(ctx!, spiders[2].x, spiders[2].y, spiders[2].size, spiders[2].leg, light);

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}
