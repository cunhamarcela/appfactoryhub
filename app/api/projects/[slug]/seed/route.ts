import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import s0 from "@/seeds/tasks.sprint0.json"
import s1 from "@/seeds/tasks.sprint1.json"
import s2 from "@/seeds/tasks.sprint2.json"
import qa from "@/seeds/checklist.qa.json"
import growth from "@/seeds/checklist.growth.json"
import ux from "@/seeds/checklist.ux.json"

import flutterFirebase from "@/seeds/stacks/flutter_firebase.json"
import flutterSupabase from "@/seeds/stacks/flutter_supabase.json"
import nextjsSupabase from "@/seeds/stacks/nextjs_supabase.json"
import rnFirebase from "@/seeds/stacks/react_native_firebase.json"

function pickStackSeed(fe: string, db: string) {
  const key = `${fe}_${db}`;
  if (key === "flutter_firebase") return flutterFirebase;
  if (key === "flutter_supabase") return flutterSupabase;
  if (key === "nextjs_supabase") return nextjsSupabase;
  if (key === "react_native_firebase") return rnFirebase;
  return flutterFirebase; // fallback
}

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    // Find the project
    const project = await prisma.project.findFirst({
      where: { 
        slug,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Check if project already has tasks/checklists
    const existingTasks = await prisma.task.count({
      where: { projectId: project.id }
    })

    const existingChecklists = await prisma.checklist.count({
      where: { projectId: project.id }
    })

    if (existingTasks > 0 || existingChecklists > 0) {
      return NextResponse.json(
        { error: "Project already has tasks or checklists" }, 
        { status: 409 }
      )
    }

    // 1) Create base tasks from seeds
    const allTasks = [...s0, ...s1, ...s2]
    const userId = session.user.id
    const tasksData = allTasks.map(task => ({
      title: task.title,
      sprint: task.sprint.toLowerCase().replace(' ', ''), // "Sprint 0" -> "sprint0"
      status: "todo",
      projectId: project.id,
      userId
    }))

    await prisma.task.createMany({
      data: tasksData
    })

    // 2) Create base checklists from seeds
    const checklistsData = [
      {
        type: qa.type,
        title: qa.title,
        items: qa.items,
        projectId: project.id
      },
      {
        type: growth.type,
        title: growth.title,
        items: growth.items,
        projectId: project.id
      },
      {
        type: ux.type,
        title: ux.title,
        items: ux.items,
        projectId: project.id
      }
    ]

    await prisma.checklist.createMany({
      data: checklistsData
    })

    // 3) Add stack-specific tasks and checklists
    const stackSeed = pickStackSeed(project.techFrontend, project.techDatabase);
    let stackTasksCreated = 0;
    let stackChecklistsCreated = 0;

    if (stackSeed?.tasks?.length) {
      const stackTasksData = stackSeed.tasks.map((t: { title: string; sprint?: string }) => ({
        title: t.title,
        sprint: (t.sprint ?? "Sprint 0").toLowerCase().replace(' ', ''),
        status: "todo",
        projectId: project.id,
        userId
      }));
      await prisma.task.createMany({ data: stackTasksData });
      stackTasksCreated = stackTasksData.length;
    }

    if (stackSeed?.checklists?.length) {
      const stackChecklistsData = stackSeed.checklists.map((c: { type: string; title: string; items: unknown }) => ({
        type: c.type,
        title: c.title,
        items: c.items as Prisma.InputJsonValue,
        projectId: project.id
      }));
      await prisma.checklist.createMany({ data: stackChecklistsData });
      stackChecklistsCreated = stackChecklistsData.length;
    }

    // 4) Create surfaces automatically (app_mobile and web_app)
    const surfacesToCreate = [
      { kind: "app_mobile", name: `${project.name} App`, projectId: project.id },
      { kind: "web_app", name: `${project.name} Web`, projectId: project.id }
    ];
    await prisma.surface.createMany({ data: surfacesToCreate });

    // Count created items
    const tasksCreated = tasksData.length + stackTasksCreated
    const checklistsCreated = checklistsData.length + stackChecklistsCreated
    const surfacesCreated = surfacesToCreate.length

    return NextResponse.json({
      success: true,
      tasksCreated,
      checklistsCreated,
      surfacesCreated,
      stackUsed: `${project.techFrontend}_${project.techDatabase}`,
      message: `Created ${tasksCreated} tasks, ${checklistsCreated} checklists, and ${surfacesCreated} surfaces for project ${project.name} (${project.techFrontend} + ${project.techDatabase})`
    })

  } catch (error) {
    console.error("Error seeding project:", error)
    return NextResponse.json(
      { error: "Failed to seed project" }, 
      { status: 500 }
    )
  }
}
