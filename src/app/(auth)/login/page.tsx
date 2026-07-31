import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold auth-heading" style={{ fontFamily: "var(--font-heading)" }}>
          Selamat datang kembali
        </h1>
        <p className="text-sm auth-body">Masuk ke akun WEAVER Anda</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm auth-footer-text">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium transition-colors" style={{ color: "#E21C70" }}>
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
