import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { slug } = body

    if (!slug) {
      return NextResponse.json(
        { error: "Project slug is required" }, 
        { status: 400 }
      )
    }

    // Get project with related data
    const project = await prisma.project.findFirst({
      where: { 
        slug,
        userId: session.user.id
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        checklists: true,
        financeRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Calculate project metrics
    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter(task => task.status === 'done').length
    const inProgressTasks = project.tasks.filter(task => task.status === 'doing').length
    const todoTasks = project.tasks.filter(task => task.status === 'todo').length
    
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const checklistProgress = project.checklists.length > 0 
      ? project.checklists.reduce((sum, checklist) => sum + checklist.progress, 0) / project.checklists.length
      : 0

    const monthlyBurn = project.financeRecords
      .filter(record => record.recurring && record.period === 'monthly')
      .reduce((sum, record) => sum + record.amount, 0)

    // Build context for the AI
    const context = `
Projeto: ${project.name}
Descrição: ${project.description || 'Não especificada'}
Stack: ${project.stack}
Nicho: ${project.niche || 'Não especificado'}
Status: ${project.status}

Métricas Atuais:
- Tasks: ${completedTasks}/${totalTasks} concluídas (${taskProgress.toFixed(1)}%)
- Tasks em progresso: ${inProgressTasks}
- Tasks pendentes: ${todoTasks}
- Progresso dos checklists: ${checklistProgress.toFixed(1)}%
- Burn mensal: R$ ${monthlyBurn.toFixed(2)}

Tasks Recentes:
${project.tasks.slice(0, 5).map(task => `- ${task.title} (${task.status}, ${task.sprint})`).join('\n')}

Checklists:
${project.checklists.map(checklist => `- ${checklist.title}: ${checklist.progress}% completo`).join('\n')}

Custos Recentes:
${project.financeRecords.slice(0, 3).map(record => `- ${record.description}: R$ ${record.amount} (${record.provider})`).join('\n')}
`

    const prompt = `Você é um consultor especialista em desenvolvimento de apps mobile e estratégia de produto. 

Analise o projeto abaixo e forneça sugestões específicas e acionáveis para os próximos passos, identificando riscos e oportunidades.

${context}

Responda APENAS com um JSON válido no seguinte formato:
{
  "next_steps": [
    {
      "title": "Título da ação",
      "why": "Por que é importante",
      "impact": "Impacto esperado"
    }
  ],
  "risks": [
    {
      "title": "Título do risco",
      "mitigation": "Como mitigar"
    }
  ],
  "cursor_prompt": "Prompt específico e detalhado para usar no Cursor IDE, incluindo contexto do projeto e instruções técnicas específicas"
}

Foque em:
1. Próximos passos baseados no progresso atual
2. Riscos técnicos e de negócio
3. Oportunidades de otimização
4. Prompt técnico específico para desenvolvimento

Seja específico e prático. Considere o stack ${project.stack} e o nicho ${project.niche || 'geral'}.`

    // Call OpenAI API
    if (!process.env.OPENAI_API_KEY) {
      // Return mock data if OpenAI is not configured
      return NextResponse.json({
        next_steps: [
          {
            title: "Implementar autenticação social",
            why: "Reduz fricção no onboarding e aumenta conversão",
            impact: "Aumento de 30-40% na taxa de registro"
          },
          {
            title: "Configurar analytics de eventos",
            why: "Dados são essenciais para otimização e monetização",
            impact: "Visibilidade completa do funil de usuários"
          },
          {
            title: "Implementar sistema de notificações",
            why: "Retenção de usuários e re-engajamento",
            impact: "Aumento de 25% na retenção D7"
          }
        ],
        risks: [
          {
            title: "Falta de validação de mercado",
            mitigation: "Fazer pesquisa com usuários e validar hipóteses principais"
          },
          {
            title: "Burn rate alto sem receita",
            mitigation: "Implementar monetização básica (ads) no Sprint 1"
          }
        ],
        cursor_prompt: `Você é um desenvolvedor Flutter sênior. Estou trabalhando no projeto "${project.name}" usando ${project.stack}. 

Contexto atual:
- ${taskProgress.toFixed(1)}% das tasks concluídas
- Stack: ${project.stack}
- Nicho: ${project.niche || 'geral'}

Próxima prioridade: Implementar autenticação social (Apple/Google) seguindo as melhores práticas.

Por favor:
1. Configure a autenticação usando ${project.stack === 'firebase' ? 'Firebase Auth' : 'Supabase Auth'}
2. Implemente providers Apple e Google
3. Crie telas de login/registro responsivas
4. Configure navegação pós-login
5. Implemente logout seguro

Use arquitetura MVVM + Riverpod. Foque em UX fluida e tratamento de erros robusto.`
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um consultor especialista em desenvolvimento de apps mobile. Responda sempre com JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error("No response from OpenAI")
    }

    // Parse JSON response
    let suggestions
    try {
      suggestions = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText)
      throw new Error("Invalid JSON response from AI")
    }

    // Validate response structure
    if (!suggestions.next_steps || !suggestions.risks || !suggestions.cursor_prompt) {
      throw new Error("Invalid response structure from AI")
    }

    return NextResponse.json(suggestions)

  } catch (error) {
    console.error("Error generating suggestions:", error)
    
    // Return a fallback response
    return NextResponse.json({
      next_steps: [
        {
          title: "Revisar progresso atual",
          why: "Importante manter momentum e identificar bloqueios",
          impact: "Maior clareza sobre próximos passos"
        }
      ],
      risks: [
        {
          title: "Serviço de IA temporariamente indisponível",
          mitigation: "Tente novamente em alguns minutos"
        }
      ],
      cursor_prompt: "Continue o desenvolvimento seguindo o roadmap definido no AGENTS.md do projeto."
    })
  }
}
