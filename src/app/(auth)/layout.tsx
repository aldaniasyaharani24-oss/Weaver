import { WebCanvas } from "@/components/landing/web-canvas";
import { WeaverLogo } from "@/components/common/weaver-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex overflow-hidden auth-layout-bg">
      <WebCanvas />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 auth-left-panel"
        style={{ position: "relative", zIndex: 20, backgroundColor: "var(--auth-panel-left, rgba(26,5,16,0.95))" }}>
        <WeaverLogo size="md" href="/" showTagline />

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-snug auth-heading" style={{ fontFamily: "var(--font-heading)" }}>
              Kelola proyek tim Anda<br />
              <span style={{ color: "#E21C70" }}>dengan bantuan AI</span>
            </h2>
            <p className="text-base leading-relaxed max-w-sm auth-body">
              Platform manajemen proyek modern yang menggabungkan workspace, AI assistant,
              kolaborasi tim, dan kecerdasan buatan dalam satu tempat.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Workspace",    icon: "🗂️" },
              { label: "AI Assistant", icon: "🤖" },
              { label: "Activity Log", icon: "📋" },
              { label: "Tim & Role",   icon: "👥" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl auth-feature-card">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium auth-feature-label">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm auth-footer-text">© {new Date().getFullYear()} WEAVER</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 auth-right-panel"
        style={{ position: "relative", zIndex: 20, backgroundColor: "var(--auth-panel-right, rgba(20,5,14,0.92))" }}>
        <div className="mb-10 lg:hidden">
          <WeaverLogo size="md" href="/" />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
