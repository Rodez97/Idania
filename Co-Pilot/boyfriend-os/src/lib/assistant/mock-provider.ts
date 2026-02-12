import type { AssistantProvider, AssistantInput, AssistantResponse } from "./types";
import { checkSafety, detectRiskFlags, PRINCIPLES } from "../guardrails";

const WARM_TEMPLATES = [
  "Entiendo lo que sientes, y quiero que sepas que me importa. {intent}. ¿Podemos hablar de esto con calma?",
  "Escucho lo que me dices y lo tomo en serio. {intent}. Quiero encontrar una solucion juntos.",
  "Valoro lo que compartes conmigo. {intent}. Estoy aqui para ti.",
];

const DIRECT_TEMPLATES = [
  "Quiero ser honesto contigo: {intent}. Creo que podemos resolverlo si hablamos directamente.",
  "Te digo lo que pienso con respeto: {intent}. ¿Que opinas tu?",
  "Sin rodeos, {intent}. Me gustaria saber tu perspectiva.",
];

const LIGHT_TEMPLATES = [
  "Oye, se que esto es importante, pero ¿podemos verlo con un poco mas de ligereza? {intent}. Al final, lo que importa es que estamos juntos en esto.",
  "No quiero que esto se sienta pesado. {intent}. ¿Que tal si lo vemos como un equipo?",
  "Con toda la buena onda: {intent}. ¿Vamos a resolverlo con un cafe?",
];

const BRIDGE_QUESTIONS = [
  "¿Que es lo mas importante para ti en esta situacion?",
  "¿Que necesitas de mi ahora mismo?",
  "¿Hay algo que no te he preguntado y deberia?",
  "¿Como te gustaria que resolvieramos esto juntos?",
  "¿Que te haria sentir escuchada/o en este momento?",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function applyTemplate(template: string, intent: string): string {
  return template.replace("{intent}", intent.toLowerCase());
}

function generateNVC(context: string, intent: string): string {
  return (
    `Observacion: Cuando ${context.slice(0, 100)}... ` +
    `Sentimiento: Me siento preocupado/a porque esta situacion nos afecta. ` +
    `Necesidad: Necesito que podamos comunicarnos con respeto y claridad. ` +
    `Peticion: ¿Podrias ${intent.toLowerCase()}?`
  );
}

const SAFE_ALTERNATIVES = [
  "Entiendo que la situacion es dificil. Me gustaria que hablaramos con honestidad y respeto. ¿Que necesitas de mi?",
  "Quiero resolver esto de una manera que sea justa para los dos. ¿Podemos empezar por escucharnos?",
  "Se que no es facil, pero prefiero ser honesto contigo. ¿Que te parece si buscamos una solucion juntos?",
];

export class MockProvider implements AssistantProvider {
  async generateDrafts(input: AssistantInput): Promise<AssistantResponse> {
    // Check safety of intent
    const intentCheck = checkSafety(input.intent);
    const contextCheck = checkSafety(input.context);

    if (!intentCheck.safe || !contextCheck.safe) {
      // Return safe alternatives
      return {
        drafts: [
          {
            tone: "warm",
            text: SAFE_ALTERNATIVES[0],
            riskFlags: [],
            bridgeQuestion: pickRandom(BRIDGE_QUESTIONS),
            nvcVersion: "Observacion: La situacion actual. Sentimiento: Preocupacion. Necesidad: Comunicacion honesta. Peticion: Hablar con respeto.",
          },
          {
            tone: "direct",
            text: SAFE_ALTERNATIVES[1],
            riskFlags: [],
            bridgeQuestion: pickRandom(BRIDGE_QUESTIONS),
            nvcVersion: "Observacion: La situacion actual. Sentimiento: Inquietud. Necesidad: Equidad. Peticion: Escucharnos mutuamente.",
          },
          {
            tone: "light",
            text: SAFE_ALTERNATIVES[2],
            riskFlags: [],
            bridgeQuestion: pickRandom(BRIDGE_QUESTIONS),
            nvcVersion: "Observacion: La situacion actual. Sentimiento: Esperanza. Necesidad: Honestidad. Peticion: Buscar soluciones juntos.",
          },
        ],
        principles: PRINCIPLES + " ⚠️ " + (intentCheck.blockedReason || contextCheck.blockedReason),
      };
    }

    const warmText = applyTemplate(pickRandom(WARM_TEMPLATES), input.intent);
    const directText = applyTemplate(pickRandom(DIRECT_TEMPLATES), input.intent);
    const lightText = applyTemplate(pickRandom(LIGHT_TEMPLATES), input.intent);

    const allFlags = [
      ...detectRiskFlags(warmText),
      ...detectRiskFlags(directText),
      ...detectRiskFlags(lightText),
    ];
    const uniqueFlags = [...new Set(allFlags)];
    const bridge = pickRandom(BRIDGE_QUESTIONS);
    const nvc = generateNVC(input.context, input.intent);

    return {
      drafts: [
        { tone: "warm", text: warmText, riskFlags: uniqueFlags, bridgeQuestion: bridge, nvcVersion: nvc },
        { tone: "direct", text: directText, riskFlags: uniqueFlags, bridgeQuestion: bridge, nvcVersion: nvc },
        { tone: "light", text: lightText, riskFlags: uniqueFlags, bridgeQuestion: bridge, nvcVersion: nvc },
      ],
      principles: PRINCIPLES,
    };
  }
}
