const BANNED_PATTERNS = [
  /\b(mient[ea]|mentir)\b/i,        // lie
  /\b(oculta|esconde|escondi)\b/i,   // hide
  /\b(amenaz\w*|intimidar)\b/i,       // threaten
  /\b(culp[ea]r|culpa)\b/i,          // guilt-trip
  /\b(manipul\w*)\b/i,               // manipulate
  /\b(gaslight)/i,                    // gaslighting
  /\b(chantaj[ea])\b/i,              // blackmail
  /\b(insult[ae]|insulto)\b/i,       // insult
  /\b(humillar)\b/i,                 // humiliate
  /\b(controlar)\b/i,                // control
  // English patterns
  /\b(lie to|deceive|trick)\b/i,
  /\b(hide the truth|conceal)\b/i,
  /\b(threaten|intimidate)\b/i,
  /\b(guilt[- ]?trip|blame)\b/i,
  /\b(manipulate|coerce)\b/i,
  /\b(gaslight)\b/i,
  /\b(blackmail)\b/i,
  /\b(insult|demean)\b/i,
  /\b(humiliate|shame)\b/i,
];

const RISK_PHRASES = [
  { pattern: /siempre (haces|dices|eres)/i, flag: "Generalizacion con 'siempre' - puede escalar" },
  { pattern: /nunca (haces|dices|eres)/i, flag: "Generalizacion con 'nunca' - puede escalar" },
  { pattern: /you always/i, flag: "Generalization with 'always' - may escalate" },
  { pattern: /you never/i, flag: "Generalization with 'never' - may escalate" },
  { pattern: /es tu culpa/i, flag: "Asignar culpa directa - defensivo" },
  { pattern: /it's your fault/i, flag: "Direct blame - may cause defensiveness" },
  { pattern: /si (de verdad|realmente) me (amaras|quisieras)/i, flag: "Condicional emocional - manipulativo" },
  { pattern: /if you really loved me/i, flag: "Emotional conditional - manipulative" },
  { pattern: /no (me importa|importas)/i, flag: "Invalidacion emocional" },
  { pattern: /i don't care/i, flag: "Emotional dismissal" },
  { pattern: /eres (igual que|como)/i, flag: "Comparacion negativa" },
  { pattern: /you('re| are) just like/i, flag: "Negative comparison" },
  { pattern: /callate|shut up/i, flag: "Silenciamiento - irrespetuoso" },
];

export interface GuardrailResult {
  safe: boolean;
  flags: string[];
  blockedReason?: string;
}

export function checkSafety(text: string): GuardrailResult {
  const flags: string[] = [];

  // Check for banned patterns
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        flags: [],
        blockedReason:
          "El texto contiene instrucciones que promueven deshonestidad, manipulacion o falta de respeto. " +
          "Se ha reemplazado con alternativas seguras basadas en honestidad, empatia y respeto.",
      };
    }
  }

  // Check for risk phrases
  for (const { pattern, flag } of RISK_PHRASES) {
    if (pattern.test(text)) {
      flags.push(flag);
    }
  }

  return { safe: true, flags };
}

export function detectRiskFlags(text: string): string[] {
  const flags: string[] = [];
  for (const { pattern, flag } of RISK_PHRASES) {
    if (pattern.test(text)) {
      flags.push(flag);
    }
  }
  return flags;
}

export const PRINCIPLES =
  "Principios: Honestidad, empatia, consentimiento y respeto mutuo. " +
  "Nunca sugerimos mentir, manipular, amenazar o hacer sentir culpa. " +
  "Cada respuesta busca conexion genuina y resolucion sana.";
