import Link from "next/link";

interface WeaverLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showTagline?: boolean;
  className?: string;
}

const SIZES = {
  sm: { icon: "size-7", text: "text-base", tagline: "text-[9px]" },
  md: { icon: "size-8", text: "text-lg",   tagline: "text-[10px]" },
  lg: { icon: "size-10", text: "text-2xl",  tagline: "text-xs" },
};

function WeaverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      {/* Outer web ring */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
      <circle cx="16" cy="16" r="9"  stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      <circle cx="16" cy="16" r="4.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      {/* Web spokes — 8 directions */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <line key={i}
            x1={16} y1={16}
            x2={16 + Math.cos(r) * 14}
            y2={16 + Math.sin(r) * 14}
            stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3"
          />
        );
      })}
      {/* Spider body — center */}
      <circle cx="16" cy="16" r="3" fill="currentColor" fillOpacity="0.9" />
      {/* Spider legs — 4 pairs */}
      <path d="M13.5 14 L9 11 M13.5 15 L8.5 15 M13.5 17 L9 19 M13.5 18 L10 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M18.5 14 L23 11 M18.5 15 L23.5 15 M18.5 17 L23 19 M18.5 18 L22 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

export function WeaverLogo({ size = "md", href = "/dashboard", showTagline = false, className = "" }: WeaverLogoProps) {
  const s = SIZES[size];

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* Icon container */}
      <div className={`${s.icon} rounded-xl flex items-center justify-center text-white shrink-0 relative overflow-hidden`}
        style={{ background: "linear-gradient(135deg, #AE0849 0%, #E21C70 60%, #F966AB 100%)" }}>
        <WeaverIcon className="size-5 text-white" />
        {/* Subtle shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-black ${s.text} tracking-[0.08em] weaver-brand`}
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "0.1em" }}>
          WEAVER
        </span>
        {showTagline && (
          <span className={`${s.tagline} weaver-tagline tracking-wide mt-0.5`}
            style={{ fontFamily: "var(--font-sans)" }}>
            Workspace · AI · Research
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}
