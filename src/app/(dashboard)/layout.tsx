import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getUserWorkspaces } from "@/features/workspace/services/workspace.service";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { WebCanvas } from "@/components/landing/web-canvas";
import { WeaverLogo } from "@/components/common/weaver-logo";
import { SidebarWrapper } from "@/features/auth/components/sidebar-wrapper";
import { MobileBottomNav } from "@/features/auth/components/mobile-bottom-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, workspaces] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    getUserWorkspaces(user.id).catch(() => []),
  ]);

  const fullName  = profileResult.data?.full_name ?? "";
  const email     = user.email ?? "";
  const displayName = fullName || email;
  const shortName   = fullName.split(" ")[0] || email.split("@")[0];
  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  // Workspace list untuk sidebar
  const workspaceList = workspaces.map(ws => ({ id: ws.id, name: ws.name, color: ws.color ?? "#E21C70", icon: ws.icon ?? null }));

  return (
    <div className="min-h-screen flex dash-layout antialiased" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Animated background ── */}
      <WebCanvas />

      {/* ── Sidebar kiri — hanya di workspace/board ── */}
      <SidebarWrapper
        workspaces={workspaceList}
        displayName={shortName}
        initials={initials}
      />

      {/* ── Kanan: header + main + footer ── */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden" style={{ zIndex: 20 }}>

        {/* Top Header */}
        <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 dash-header">
          <WeaverLogo size="sm" href="/dashboard" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-16">
          {children}
        </main>

        {/* Bottom bar — desktop only */}
        <footer className="hidden md:flex fixed bottom-0 left-[220px] right-0 h-12 items-center justify-between px-4 z-40 dash-footer">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase select-none"
              style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}
              title={displayName}>
              {initials.charAt(0)}
            </div>
            <span className="text-xs font-medium hidden md:inline truncate max-w-[100px] dash-username">
              {shortName}
            </span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-xs sm:text-sm font-medium transition-colors dash-nav-link flex items-center gap-1.5">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Tasks
            </Link>
            <span className="text-xs sm:text-sm font-medium cursor-pointer dash-nav-muted" title="Segera Hadir">My Events</span>
            <span className="text-xs sm:text-sm font-medium cursor-pointer dash-nav-muted" title="Segera Hadir">My Bookmarks</span>
            <span className="text-xs sm:text-sm font-medium cursor-pointer dash-nav-muted" title="Segera Hadir">My Notes</span>
          </nav>

          <div className="flex items-center gap-2">
            <button className="text-xs font-medium transition-all px-2 py-1 rounded-lg dash-pings-btn">Pings +</button>
            <button className="px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 transition-all dash-new-btn">
              <span className="size-1.5 rounded-full animate-pulse" style={{ background: "#E21C70" }} />
              <span className="hidden sm:inline dash-new-text">2 New</span>
            </button>
          </div>
        </footer>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <MobileBottomNav />
    </div>
  );
}
