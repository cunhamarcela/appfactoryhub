import { NextRequest, NextResponse } from "next/server";
import flutterFirebase from "@/seeds/stacks/flutter_firebase.json";
import flutterSupabase from "@/seeds/stacks/flutter_supabase.json";
import nextjsSupabase from "@/seeds/stacks/nextjs_supabase.json";
import rnFirebase from "@/seeds/stacks/react_native_firebase.json";

function pickStackSeed(lang: string, fe: string, be: string, db: string) {
  const key = `${fe}_${db}`; // heurística simples
  if (key === "flutter_firebase") return flutterFirebase;
  if (key === "flutter_supabase") return flutterSupabase;
  if (key === "nextjs_supabase") return nextjsSupabase;
  if (key === "react_native_firebase") return rnFirebase;
  return flutterFirebase; // fallback
}

export async function POST(req: NextRequest) {
  const { techLanguage, techFrontend, techBackend, techDatabase } = await req.json();
  const seed = pickStackSeed(techLanguage, techFrontend, techBackend, techDatabase);
  return NextResponse.json({ checklists: seed.checklists ?? [], tasks: seed.tasks ?? [] });
}
