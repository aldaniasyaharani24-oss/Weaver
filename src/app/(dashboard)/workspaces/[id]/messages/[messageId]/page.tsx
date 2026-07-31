import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMessageDetail } from "@/features/message/services/message.service";
import { CreateCommentForm } from "@/features/message/components/create-comment-form";
import { DeleteMessageButton, DeleteCommentButton } from "@/features/message/components/delete-message-button";

interface MessageDetailPageProps {
  params: Promise<{ id: string; messageId: string }>;
}

export default async function MessageDetailPage({ params }: MessageDetailPageProps) {
  const { id, messageId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const detail = await getMessageDetail(messageId);
  if (!detail) notFound();

  const { message, comments } = detail;
  const isMessageAuthor = user.id === message.user_id;

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
        <span className="text-white/70 line-clamp-1 max-w-[200px]">{message.title}</span>
      </div>

      {/* Message Card */}
      <div className="bg-[#141f28] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {/* Message Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">
              {message.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm uppercase select-none shrink-0">
                {message.author_name ? message.author_name.charAt(0) : "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {message.author_name || "Anggota"}
                </p>
                <p className="text-xs text-white/40">
                  Diposting pada{" "}
                  {new Date(message.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
          {isMessageAuthor && (
            <div className="shrink-0">
              <DeleteMessageButton messageId={messageId} workspaceId={id} />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="p-6 md:p-8">
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-[15px]">
              {message.content}
            </p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">
            Komentar
          </h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-white/60 rounded-full">
            {comments.length}
          </span>
        </div>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10 border-dashed">
            <p className="text-white/40 text-sm">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                {/* Author Avatar */}
                <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm uppercase select-none">
                  {comment.author_name ? comment.author_name.charAt(0) : "?"}
                </div>

                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {comment.author_name || "Anggota"}
                      </span>
                      {user.id === comment.user_id && (
                        <DeleteCommentButton
                          commentId={comment.id}
                          messageId={messageId}
                          workspaceId={id}
                        />
                      )}
                    </div>
                    <span className="text-xs text-white/30">
                      {new Date(comment.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment Form */}
        <div className="bg-[#141f28] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Tambahkan Komentar</h3>
          <CreateCommentForm workspaceId={id} messageId={messageId} />
        </div>
      </div>

      {/* Back Button */}
      <div className="pt-4">
        <Link
          href={`/workspaces/${id}/messages`}
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Kembali ke Message Board
        </Link>
      </div>
    </div>
  );
}
