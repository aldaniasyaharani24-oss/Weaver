import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Nama workspace harus diisi").max(80, "Nama terlalu panjang"),
  description: z.string().max(500, "Deskripsi terlalu panjang").optional(),
  icon: z.string().max(10).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna tidak valid")
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nama workspace harus diisi").max(80, "Nama terlalu panjang"),
  description: z.string().max(500, "Deskripsi terlalu panjang").optional(),
  icon: z.string().max(10).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna tidak valid")
    .optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
