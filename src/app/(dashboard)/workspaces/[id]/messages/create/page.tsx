import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateMessageForm } from "@/features/message/components/create-message-form";

interface CreateMessagePageProps {
  params: Promise<{ id: string }>;
}

export default async function CreateMessagePage({ params }: CreateMessagePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <Link href={`/workspaces/${id}`} className="hover:text-white transition-colors">
          Workspace
        </Link>
        <span>/</span>
        <Link href={`/workspaces/${id}/messages`} className="hover:text-white transition-colors">
          Message Board
        </Link>
        <span>/</span>
        <span className="text-white/70">Pesan Baru</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-basecamp-green/20 flex items-center justify-center">
          <svg className="size-5 text-basecamp-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Buat Pesan Baru</h1>
          <p className="text-sm text-white/50">Pengumuman atau diskusi akan dibagikan ke seluruh anggota workspace</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#141f28] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        <CreateMessageForm workspaceId={id} />
      </div>
    </div>
  );
}
