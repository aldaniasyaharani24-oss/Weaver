"use client";

import { useState } from "react";
import { createCommentAction } from "../actions/message.actions";
import { toast } from "sonner";

interface CreateCommentFormProps {
  workspaceId: string;
  messageId: string;
}

export function CreateCommentForm({ workspaceId, messageId }: CreateCommentFormProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }

    setLoading(true);

    const result = await createCommentAction(
      {
        messageId,
        content,
      },
      workspaceId
    );

    if (result.error) {
      toast.error(result.error);
    } else {
      setContent("");
      toast.success("Komentar ditambahkan");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="flex gap-4">
        {/* Placeholder Avatar */}
        <div className="size-10 rounded-full bg-white/10 shrink-0 border border-white/20 flex items-center justify-center">
          <svg className="size-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tambahkan komentar..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-basecamp-green focus:border-transparent transition-all resize-y text-sm"
            disabled={loading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-5 py-2 bg-basecamp-green hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mengirim..." : "Kirim Komentar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
