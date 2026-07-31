import { z } from "zod";

export const createMessageSchema = z.object({
  workspaceId: z.string().uuid("ID Workspace tidak valid"),
  title: z.string().min(1, "Judul pesan harus diisi").max(255, "Judul terlalu panjang"),
  content: z.string().min(1, "Isi pesan tidak boleh kosong"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const createCommentSchema = z.object({
  messageId: z.string().uuid("ID Pesan tidak valid"),
  content: z.string().min(1, "Komentar tidak boleh kosong").max(1000, "Komentar terlalu panjang"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
