import { generateText } from "ai";
import { groq, AI_MODEL_FAST, isAIConfigured } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!isAIConfigured()) {
    return Response.json({ error: "AI belum dikonfigurasi" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { description, workspace_name, count = 5 } = body;

  if (!description?.trim()) {
    return Response.json({ error: "Deskripsi proyek diperlukan" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: groq(AI_MODEL_FAST),
      prompt: `Kamu adalah asisten manajemen proyek. Berdasarkan deskripsi proyek berikut, buatkan daftar ${count} task konkret yang perlu dikerjakan.

Nama proyek: ${workspace_name}
Deskripsi: ${description}

Kembalikan HANYA JSON valid tanpa penjelasan apapun, dengan format persis seperti ini:
{
  "tasks": [
    {
      "title": "Judul task singkat",
      "description": "Deskripsi singkat 1-2 kalimat",
      "priority": "high",
      "estimated_hours": 4
    }
  ]
}

Aturan:
- priority hanya boleh: "low", "medium", atau "high"
- estimated_hours harus angka antara 1-40
- Buat tepat ${count} task dalam Bahasa Indonesia
- Jangan tambahkan teks lain selain JSON`,
    });

    // Parse JSON dari response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Response bukan JSON valid");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validasi dan sanitasi tasks
    const tasks = (parsed.tasks ?? []).map((t: {
      title?: string;
      description?: string;
      priority?: string;
      estimated_hours?: number;
    }) => ({
      title: String(t.title ?? "Task").slice(0, 100),
      description: String(t.description ?? "").slice(0, 300),
      priority: ["low", "medium", "high"].includes(t.priority ?? "")
        ? t.priority
        : "medium",
      estimated_hours: Math.min(Math.max(Number(t.estimated_hours) || 2, 1), 40),
    }));

    return Response.json({ tasks });
  } catch (err) {
    console.error("[generate-tasks] error:", err);
    return Response.json({ error: "Gagal generate task" }, { status: 500 });
  }
}
