import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { callFeaturePlannerLLM } from "@/lib/openai";

export async function POST(req: NextRequest) {
  // Verificar autenticação
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  try {
    const out = await callFeaturePlannerLLM(payload);
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
