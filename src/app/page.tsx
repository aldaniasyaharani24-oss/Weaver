import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WebCanvas } from "@/components/landing/web-canvas";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { WeaverLogo } from "@/components/common/weaver-logo";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden antialiased">

      {/* ── Background: dark mode ── */}
      <div className="fixed inset-0 dark-bg-landing" style={{ zIndex: 0 }} />

      {/* ── Animated spider canvas ── */}
      <WebCanvas />

      {/* ── Gradient ambient (dark only) ── */}
      <div className="fixed inset-0 pointer-events-none dark-ambient" style={{ zIndex: 1 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #E21C70, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #AE0849, transparent)" }} />
      </div>

      {/* ── All content above canvas ── */}
      <div className="relative" style={{ zIndex: 20 }}>

        {/* ── Header ── */}
        <header className="h-16 flex items-center px-6 md:px-12 landing-header">
          <WeaverLogo size="md" href="/" />
          <div className="flex-1" />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="text-sm px-4 py-2 rounded-lg transition-colors landing-nav-link">
              Masuk
            </Link>
            <Link href="/register"
              className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", boxShadow: "0 4px 15px rgba(226,28,112,0.3)" }}>
              Mulai Gratis
            </Link>
          </nav>
        </header>

        {/* ── Hero section ── */}
        <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center py-16 landing-hero">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 animate-bounce-in"
            style={{ background: "rgba(226,28,112,0.15)", border: "1px solid rgba(249,102,171,0.3)", color: "#E21C70" }}>
            <span className="size-1.5 rounded-full animate-pulse" style={{ background: "#E21C70" }} />
            WEAVER · Workspace untuk Setiap Proyek Tim
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight mb-6 animate-bounce-in landing-h1"
            style={{ fontFamily: "var(--font-heading)", animationDelay: "0.1s" }}>
            Kelola Proyek Tim{" "}
            <span style={{ color: "#E21C70" }}>Lebih Cerdas</span>
          </h1>

          <p className="text-base sm:text-lg max-w-xl leading-relaxed mb-10 animate-bounce-in landing-p"
            style={{ animationDelay: "0.2s" }}>
            Platform kolaborasi cerdas yang membantu tim mengelola proyek, tugas, dan deadline dalam satu workspace.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 flex-wrap justify-center animate-bounce-in mb-6"
            style={{ animationDelay: "0.3s" }}>
            <Link href="/register"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", boxShadow: "0 8px 30px rgba(226,28,112,0.35)" }}>
              Mulai Sekarang
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)" }}>Gratis</span>
            </Link>
            <Link href="/login"
              className="px-7 py-3.5 rounded-xl font-medium text-base transition-all hover:scale-105 landing-secondary-btn">
              Sudah punya akun
            </Link>
          </div>

          <p className="text-xs animate-bounce-in landing-muted" style={{ animationDelay: "0.4s" }}>
            Tidak perlu kartu kredit · Gratis selamanya
          </p>

          {/* AI Status badge */}
          <div className="mt-10 animate-bounce-in" style={{ animationDelay: "0.7s" }}>
            <div className="inline-flex items-start gap-3 px-4 py-3 rounded-2xl text-left max-w-xs landing-badge"
              style={{ backdropFilter: "blur(12px)" }}>
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0 animate-web-pulse"
                style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
                {/* WEAVER spider icon */}
                <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4"/>
                  <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
                  {[0,60,120,180,240,300].map((deg,i) => {
                    const r = (deg * Math.PI) / 180;
                    return <line key={i} x1="12" y1="12" x2={12+Math.cos(r)*9} y2={12+Math.sin(r)*9} stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.4"/>;
                  })}
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#E21C70" }}>
                  AI Agent Status: Optimal.
                </p>
                <p className="text-xs mt-0.5 landing-muted">
                  Sprint dianalisis. Tinjau wawasan AI Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features section ── */}
        <section className="py-20 px-6 landing-features-section">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-3 landing-h2"
              style={{ fontFamily: "var(--font-heading)" }}>
              Semua yang tim Anda butuhkan
            </h2>
            <p className="text-center mb-14 text-sm landing-sub">
              Satu platform untuk workspace, task, kolaborasi, dan AI.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: "🗂️", title: "Workspace & Kanban", desc: "Organisasi proyek dalam workspace. Kanban board dengan drag & drop.", grad: "#E21C70" },
                { icon: "🤖", title: "AI Assistant", desc: "Generate task otomatis, analisis risiko deadline, dan ringkasan proyek.", grad: "#7c3aed" },
                { icon: "👥", title: "Kolaborasi Tim", desc: "Undang anggota tim, atur role, dan pantau kontribusi setiap orang.", grad: "#AE0849" },
                { icon: "📊", title: "Overview Proyek", desc: "Statistik real-time: progress, task terlambat, deadline terdekat.", grad: "#F966AB" },
                { icon: "📋", title: "Activity Log", desc: "Rekam semua aktivitas tim secara otomatis — siapa melakukan apa.", grad: "#a855f7" },
                { icon: "🎯", title: "Priority Analysis", desc: "AI menganalisis task overdue dan at-risk, berikan rekomendasi.", grad: "#E21C70" },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl p-6 transition-all hover:-translate-y-1 landing-feature-card">
                  <div className="size-10 rounded-xl flex items-center justify-center mb-4 text-xl"
                    style={{ background: `${f.grad}22` }}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 landing-card-title"
                    style={{ fontFamily: "var(--font-heading)" }}>
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed landing-card-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA section ── */}
        <section className="py-20 px-6 text-center landing-cta-section">
          <h2 className="text-2xl font-bold mb-3 landing-h2" style={{ fontFamily: "var(--font-heading)" }}>
            Siap memulai?
          </h2>
          <p className="mb-8 text-sm landing-sub">Bergabung dan mulai kelola proyek Anda hari ini.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-105 animate-web-pulse"
            style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", boxShadow: "0 8px 30px rgba(226,28,112,0.35)" }}>
            Buat Akun Gratis
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </section>

        {/* ── Footer ── */}
        <footer className="py-6 px-6 text-center landing-footer">
          <p className="text-xs landing-muted">
            © {new Date().getFullYear()} WEAVER · Dibangun dengan Next.js & Supabase
          </p>
        </footer>

      </div>
    </div>
  );
}
