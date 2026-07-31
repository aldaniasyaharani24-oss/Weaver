"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMessageAction } from "../actions/message.actions";
import { toast } from "sonner";
import Link from "next/link";

interface CreateMessageFormProps {
  workspaceId: string;
}

export function CreateMessageForm({ workspaceId }: CreateMessageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Judul dan isi pesan tidak boleh kosong");
      return;
    }

    setLoading(true);

    const result = await createMessageAction({
      workspaceId,
      title,
      content,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Pesan berhasil dipublikasikan!");
      router.push(`/workspaces/${workspaceId}/messages/${result.messageId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-white/90">
          Judul Pesan
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tuliskan judul pengumuman atau diskusi..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-basecamp-green focus:border-transparent transition-all"
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-white/90">
          Isi Pesan
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Jelaskan detail pesan Anda di sini..."
          rows={10}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-basecamp-green focus:border-transparent transition-all resize-y"
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-basecamp-green hover:bg-emerald-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Memublikasikan..." : "Publikasikan Pesan"}
        </button>
        <Link
          href={`/workspaces/${workspaceId}`}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-xl transition-all"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
