import type { Mood } from "@prisma/client";
import type { SuggestionItem } from "@/types";

interface SuggestionContext {
  mood: Mood | null;
  upcomingEventsCount: number;
  hasPartnerProfile: boolean;
  recentConflicts: number;
}

const MICRO_GESTURES: Record<Mood, SuggestionItem[]> = {
  great: [
    { type: "micro-gesture", text: "Enviale un mensaje de agradecimiento espontaneo", emoji: "💌" },
    { type: "micro-gesture", text: "Planifica una sorpresa pequeña para hoy", emoji: "🎁" },
    { type: "micro-gesture", text: "Dile algo especifico que admiras de ella", emoji: "✨" },
  ],
  ok: [
    { type: "micro-gesture", text: "Preguntale como fue su dia con interes genuino", emoji: "🤗" },
    { type: "micro-gesture", text: "Ofrece hacer algo que ella necesite hoy", emoji: "🤝" },
    { type: "micro-gesture", text: "Comparte un recuerdo bonito que tengan juntos", emoji: "📸" },
  ],
  distant: [
    { type: "micro-gesture", text: "Envia un mensaje corto: 'Estoy pensando en ti'", emoji: "💭" },
    { type: "micro-gesture", text: "Dale espacio pero hazle saber que estas disponible", emoji: "🌿" },
    { type: "micro-gesture", text: "Propón una actividad tranquila juntos", emoji: "☕" },
  ],
  tense: [
    { type: "micro-gesture", text: "Respira profundo antes de responder cualquier cosa", emoji: "🧘" },
    { type: "micro-gesture", text: "Reconoce sus sentimientos sin intentar 'arreglar'", emoji: "💛" },
    { type: "micro-gesture", text: "Pregunta: '¿Que necesitas de mi ahora mismo?'", emoji: "🫂" },
  ],
};

const SMALL_PLANS: SuggestionItem[] = [
  { type: "small-plan", text: "Cocinar juntos algo nuevo esta noche", emoji: "🍳" },
  { type: "small-plan", text: "Caminar 15 minutos juntos sin telefonos", emoji: "🚶" },
  { type: "small-plan", text: "Ver un episodio de algo que les guste a ambos", emoji: "📺" },
  { type: "small-plan", text: "Tomar cafe/te juntos con musica tranquila", emoji: "☕" },
];

const PRO_PLANS: SuggestionItem[] = [
  { type: "pro-plan", text: "Escribir una carta de aprecio con 3 cosas especificas", emoji: "📝" },
  { type: "pro-plan", text: "Planear una cita sorpresa basada en sus gustos", emoji: "🌟" },
  { type: "pro-plan", text: "Crear un playlist juntos para la semana", emoji: "🎵" },
  { type: "pro-plan", text: "Investigar un lugar nuevo para visitar el fin de semana", emoji: "🗺️" },
];

const BRIDGE_QUESTIONS: SuggestionItem[] = [
  { type: "bridge-question", text: "¿Que podria hacer diferente para que te sientas mas apoyada?", emoji: "🌉" },
  { type: "bridge-question", text: "¿Hay algo que te preocupa y no me has dicho?", emoji: "🔑" },
  { type: "bridge-question", text: "¿Como te sentiste con lo que paso?", emoji: "🪞" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSuggestions(ctx: SuggestionContext): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];
  const mood = ctx.mood ?? "ok";

  // Always show a micro-gesture
  suggestions.push(pickRandom(MICRO_GESTURES[mood]));

  // Small plan
  suggestions.push(pickRandom(SMALL_PLANS));

  // Pro plan
  suggestions.push(pickRandom(PRO_PLANS));

  // If tense, add bridge question
  if (mood === "tense" || mood === "distant") {
    suggestions.push(pickRandom(BRIDGE_QUESTIONS));
  }

  return suggestions;
}
