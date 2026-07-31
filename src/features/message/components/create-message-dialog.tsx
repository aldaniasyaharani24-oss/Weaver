"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMessageAction } from "../actions/message.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateMessageDialogProps {
  workspaceId: string;
  children?: React.ReactNode;
}

export function CreateMessageDialog({ workspaceId, children }: CreateMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error("Judul dan isi pesan tidak boleh kosong"); return; }
    setLoading(true);
    const result = await createMessageAction({ workspaceId, title, content });
    if (result.error) { toast.error(result.error); setLoading(false); return; }
    toast.success("Pesan berhasil dipublikasikan!");
    setTitle(""); setContent(""); setOpen(false); setLoading(false);
    if (result.messageId) { router.push(`/workspaces/${workspaceId}/messages/${result.messageId}`); }
    else { router.refresh(); }
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children ?? (
          <button type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Buat Pesan Baru
          </button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <span className="size-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </span>
              Buat Pesan / Pengumuman
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="msg-title" className="text-gray-700">Judul Pesan</Label>
              <Input id="msg-title" placeholder="Tuliskan judul pengumuman..." value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-content" className="text-gray-700">Isi Pesan</Label>
              <Textarea id="msg-content" placeholder="Jelaskan detail pengumuman..." rows={6} value={content} onChange={(e) => setContent(e.target.value)} disabled={loading} className="resize-y" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? "Memublikasikan..." : "Publikasikan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
