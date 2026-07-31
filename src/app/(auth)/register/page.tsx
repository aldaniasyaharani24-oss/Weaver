import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold auth-heading" style={{ fontFamily: "var(--font-heading)" }}>
          Buat akun WEAVER
        </h1>
        <p className="text-sm auth-body">Mulai kelola proyek Anda secara gratis</p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm auth-footer-text">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium transition-colors" style={{ color: "#E21C70" }}>
          Masuk
        </Link>
      </p>
    </div>
  );
}
