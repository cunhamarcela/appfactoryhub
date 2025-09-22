import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FeaturePlanResponse = {
  cursor_prompt: string;
  tasks: { title: string }[];
  checklist_additions: { id: string; label: string; done: boolean }[];
  cross_surface: { id: string; label: string; done: boolean }[];
};

export async function callFeaturePlannerLLM(payload: Record<string, unknown>): Promise<FeaturePlanResponse> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const prompt = `Você é o "Feature Planner". Gere APENAS JSON com as chaves:
{
  "cursor_prompt":"string",
  "tasks":[{"title":"..."}],
  "checklist_additions":[{"id":"...","label":"...","done":false}],
  "cross_surface":[{"id":"...","label":"...","done":false}]
}
Contexto: ${JSON.stringify(payload, null, 2)}
Regras:
- Não invente chaves.
- Máx 6 tasks objetivas.
- Se existir web_app e a feature não selecionou, incluir item cross_surface correspondente (e vice-versa).
- Cursor_prompt deve citar arquivos/camadas impactadas e eventos analytics/ads conforme Playbook.`;

  // Modelo livre; use aquele que você tiver disponível
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  // Tentar parsear
  try { return JSON.parse(content); } catch { return { cursor_prompt:"", tasks:[], checklist_additions:[], cross_surface:[] }; }
}
