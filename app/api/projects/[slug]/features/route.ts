import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ghGetLanguages, ghGetTree } from "@/lib/github";
import commonFeatureChecklist from "@/seeds/stacks/common_feature_checklist.json";
import { callFeaturePlannerLLM } from "@/lib/openai";
import { Prisma } from "@prisma/client";

interface FeaturePlan {
  cursor_prompt: string;
  tasks: { title: string }[];
  checklist_additions: { id: string; label: string; done: boolean }[];
  cross_surface: { id: string; label: string; done: boolean }[];
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // Verificar autenticação
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const project = await prisma.project.findUnique({ 
    where: { 
      slug,
      userId: session.user.id // Verificar propriedade do projeto
    }, 
    include: { features: { orderBy: { createdAt: 'desc' } } }
  });
  
  if (!project) return NextResponse.json({ error: "project_not_found" }, { status: 404 });
  
  return NextResponse.json({ features: project.features });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // Verificar autenticação
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, surfaces = ["app_mobile"], autoPlan = true } = body;

  // Validações de entrada
  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  if (!surfaces || surfaces.length === 0) {
    return NextResponse.json({ error: "surfaces_required" }, { status: 400 });
  }
  if (!Array.isArray(surfaces) || !surfaces.every(s => typeof s === 'string')) {
    return NextResponse.json({ error: "invalid_surfaces_format" }, { status: 400 });
  }

  const { slug } = await params;
  const project = await prisma.project.findUnique({ 
    where: { 
      slug,
      userId: session.user.id // Verificar propriedade do projeto
    }, 
    include: { surfaces: true }
  });
  
  if (!project) return NextResponse.json({ error: "project_not_found" }, { status: 404 });

  // 1) snapshot do repo
  let repoSnapshot: Prisma.InputJsonValue | undefined = undefined;
  if (project.repoFullName) {
    try {
      const languages = await ghGetLanguages(project.repoFullName);
      const tree = await ghGetTree(project.repoFullName);
      repoSnapshot = { languages, tree } as Prisma.InputJsonValue;
    } catch (e) {
      // mantém sem snapshot
      repoSnapshot = { error: "snapshot_failed", message: String(e) } as Prisma.InputJsonValue;
    }
  }

  // 2) criar feature
  const feature = await prisma.feature.create({
    data: {
      projectId: project.id,
      title,
      description,
      surfaces,
      repoSnapshot
    }
  });

  // 3) gerar plano via LLM (prompt -> tasks/checklists)
  let planner: FeaturePlan = { cursor_prompt:"", tasks:[], checklist_additions:[], cross_surface:[] };
  if (autoPlan) {
    const payload = {
      project: {
        name: project.name, slug: project.slug,
        techLanguage: project.techLanguage, techFrontend: project.techFrontend,
        techBackend: project.techBackend, techDatabase: project.techDatabase,
        surfaces: project.surfaces.map(s => s.kind)
      },
      feature: { title, description, surfaces },
      repoSnapshot,
      playbook: { // placeholders — você pode buscar os conteúdos reais se desejar
        agentsMd: "AGENTS.md",
        analytics: "ANALYTICS_EVENTS.md",
        ads: "ADS_PLAYBOOK.md",
        auth: "AUTH_SPEC.md"
      }
    };
    try {
      planner = await callFeaturePlannerLLM(payload);
    } catch {
      planner = { cursor_prompt:"", tasks:[], checklist_additions:[], cross_surface:[] };
    }
  }

  // 4) checklist padrão de feature + additions + cross_surface
  const featureChecklistItems = [
    ...commonFeatureChecklist.items,
    ...(planner.checklist_additions ?? []),
    ...(planner.cross_surface ?? [])
  ];
  await prisma.checklist.create({
    data: {
      projectId: project.id,
      type: "FEATURE_PLAN",
      title: `Feature: ${title}`,
      items: featureChecklistItems
    }
  });

  // 5) tasks derivadas do planner (Sprint 1 por padrão)
  if (planner.tasks?.length) {
    await prisma.task.createMany({
      data: planner.tasks.slice(0, 6).map((t: { title: string }) => ({
        title: t.title,
        sprint: "Sprint 1",
        projectId: project.id,
        userId: project.userId
      }))
    });
  }

  return NextResponse.json({
    feature: { id: feature.id, status: feature.status },
    prompt: planner.cursor_prompt ?? "",
    checklist: { title: `Feature: ${title}`, items: featureChecklistItems },
    tasks: planner.tasks ?? []
  });
}
