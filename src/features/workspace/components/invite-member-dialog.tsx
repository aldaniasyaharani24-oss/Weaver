"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { inviteMemberAction } from "../actions/member.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WorkspaceRole } from "../types/workspace";

interface InviteMemberDialogProps {
  workspaceId: string;
  children: React.ReactNode;
}

export function InviteMemberDialog({ workspaceId, children }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("member");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const result = await inviteMemberAction({ workspace_id: workspaceId, email, role });
    if (result?.error) { toast.error(result.error); setLoading(false); return; }
    toast.success("Anggota berhasil ditambahkan!");
    setEmail(""); setRole("member"); setOpen(false); setLoading(false);
    router.refresh();
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <span className="size-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </span>
              Undang Anggota
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="inv-email" className="text-gray-700">Email</Label>
              <Input id="inv-email" type="email" placeholder="email@contoh.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
              <p className="text-xs text-gray-400">Pengguna harus sudah terdaftar di aplikasi ini.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-700">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as WorkspaceRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — kelola anggota &amp; board</SelectItem>
                  <SelectItem value="member">Member — kelola task</SelectItem>
                  <SelectItem value="viewer">Viewer — hanya lihat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? "Mengirim..." : "Undang"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
