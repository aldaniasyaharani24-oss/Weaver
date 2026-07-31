import { z } from "zod";

export const createBoardSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  title: z.string().min(1, "Judul board harus diisi"),
  description: z.string().optional(),
});

export const updateBoardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Judul board harus diisi"),
  description: z.string().optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
