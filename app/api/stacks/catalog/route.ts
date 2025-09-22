import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    languages: ["flutter","react","react_native"],
    frontends: ["flutter","nextjs","react_native"],
    backends:  ["none","node","firebase_functions","supabase_edge"],
    databases: ["firebase","supabase"]
  });
}
