import OpenAI from "openai";
import type { AssistantProvider, AssistantInput, AssistantResponse, DraftResult } from "./types";
import { checkSafety, detectRiskFlags, PRINCIPLES } from "../guardrails";

export class OpenAIProvider implements AssistantProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async generateDrafts(input: AssistantInput): Promise<AssistantResponse> {
    // Pre-check safety
    const intentCheck = checkSafety(input.intent);
    const contextCheck = checkSafety(input.context);

    if (!intentCheck.safe || !contextCheck.safe) {
      // Fall back to safe response without calling API
      const { MockProvider } = await import("./mock-provider");
      const mock = new MockProvider();
      return mock.generateDrafts(input);
    }

    const systemPrompt = `Eres un asistente de comunicacion en pareja. Tu objetivo es ayudar a comunicar de forma honesta, empatica y respetuosa.

REGLAS ESTRICTAS:
- NUNCA sugieras mentir, ocultar, manipular, amenazar o hacer sentir culpa
- Siempre promueve honestidad, empatia, consentimiento y respeto
- Genera exactamente 3 borradores con tonos: calido (warm), directo (direct), ligero (light)
- Incluye banderas de riesgo si detectas frases que podrian escalar el conflicto
- Incluye una "pregunta puente" para desescalar
- Incluye una version NVC (Observacion-Sentimiento-Necesidad-Peticion)

Responde en JSON con este formato:
{
  "drafts": [
    { "tone": "warm", "text": "...", "riskFlags": [], "bridgeQuestion": "...", "nvcVersion": "..." },
    { "tone": "direct", "text": "...", "riskFlags": [], "bridgeQuestion": "...", "nvcVersion": "..." },
    { "tone": "light", "text": "...", "riskFlags": [], "bridgeQuestion": "...", "nvcVersion": "..." }
  ]
}`;

    const userPrompt = `Contexto de la conversacion: ${input.context}\n\nIntencion del usuario: ${input.intent}\n\nGenera 3 borradores de respuesta.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content) as { drafts: DraftResult[] };

    // Post-check safety on all drafts
    const safeDrafts = parsed.drafts.map((draft) => {
      const check = checkSafety(draft.text);
      if (!check.safe) {
        return {
          ...draft,
          text: "Se detecto contenido potencialmente dañino. Por favor, reformula tu intencion con honestidad y respeto.",
          riskFlags: [check.blockedReason || "Contenido bloqueado por guardrails"],
        };
      }
      return {
        ...draft,
        riskFlags: [...(draft.riskFlags || []), ...detectRiskFlags(draft.text)],
      };
    });

    return {
      drafts: safeDrafts,
      principles: PRINCIPLES,
    };
  }
}
