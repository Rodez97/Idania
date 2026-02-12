"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { conflictSchema, type ConflictInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// --- Mock calm-message templates ---

const CALM_TEMPLATES: Record<string, string[]> = {
  repair: [
    "Entiendo que esto ha sido dificil. Quiero que sepamos que estoy comprometido a reparar esto juntos. {topic} es importante para mi porque tu eres importante para mi.",
    "Se que las cosas no han estado bien respecto a {topic}. Quiero que sepas que estoy aqui, dispuesto a escucharte y trabajar juntos en esto.",
    "Lamento que {topic} nos haya afectado asi. Quiero que encontremos una forma de sanar esto juntos, con honestidad y paciencia.",
  ],
  clarify: [
    "Quiero asegurarme de que nos entendemos bien sobre {topic}. ¿Podemos tomarnos un momento para hablar con calma y claridad?",
    "Siento que hay cosas sobre {topic} que necesitamos aclarar. Me gustaria escuchar tu perspectiva sin interrupciones.",
    "Creo que vale la pena hablar de {topic} con tranquilidad para asegurarnos de que ambos estamos en la misma pagina.",
  ],
  boundary: [
    "Necesito ser honesto contigo sobre {topic}. Hay un limite que necesito establecer, y quiero hacerlo con respeto y claridad.",
    "Te quiero, y por eso necesito hablarte sobre {topic}. Necesito que respetemos ciertos limites para que ambos estemos bien.",
    "Parte de cuidar nuestra relacion es ser claros sobre lo que necesitamos. Respecto a {topic}, necesito establecer un limite importante.",
  ],
};

const NEXT_STEPS_TEMPLATES: Record<string, string[][]> = {
  repair: [
    [
      "Tomarse 10 minutos de pausa antes de hablar",
      "Cada uno escribe 3 sentimientos sobre la situacion",
      "Compartir sin interrumpir, usando 'yo siento' en vez de 'tu haces'",
      "Acordar una accion concreta de reparacion",
    ],
    [
      "Reconocer que ambos estan heridos",
      "Escuchar activamente sin defenderse",
      "Encontrar un punto de acuerdo para empezar",
      "Planear un momento positivo juntos esta semana",
    ],
  ],
  clarify: [
    [
      "Escribir cada uno su version de lo que paso",
      "Compartir las versiones sin juzgar",
      "Identificar los malentendidos especificos",
      "Acordar como comunicarse mejor la proxima vez",
    ],
    [
      "Definir el tema exacto que necesitan aclarar",
      "Turnarse para hablar sin interrupciones (3 min cada uno)",
      "Repetir lo que entendieron del otro para confirmar",
      "Cerrar con un resumen de lo acordado",
    ],
  ],
  boundary: [
    [
      "Identificar el limite especifico que necesitas",
      "Explicar por que este limite es importante para ti",
      "Escuchar la perspectiva de tu pareja sobre el limite",
      "Acordar como respetar este limite en la practica",
    ],
    [
      "Escribir el limite con claridad antes de la conversacion",
      "Compartirlo con empatia, no como castigo",
      "Negociar ajustes si es posible sin perder lo esencial",
      "Establecer que pasa si el limite no se respeta",
    ],
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCalmMessage(topic: string, goal: string): string {
  const templates = CALM_TEMPLATES[goal] || CALM_TEMPLATES.repair;
  return pickRandom(templates).replace(/\{topic\}/g, topic);
}

function generateNVCMessage(topic: string): string {
  return (
    `Observacion: Cuando hablamos sobre ${topic}, noto que la situacion se pone tensa. ` +
    `Sentimiento: Me siento preocupado/a porque valoro nuestra relacion y quiero que estemos bien. ` +
    `Necesidad: Necesito que podamos hablar de esto con respeto y sin atacarnos. ` +
    `Peticion: ¿Podemos sentarnos a hablar de ${topic} con calma, escuchandonos sin interrumpir?`
  );
}

function generateNextSteps(goal: string): string[] {
  const templates = NEXT_STEPS_TEMPLATES[goal] || NEXT_STEPS_TEMPLATES.repair;
  return pickRandom(templates);
}

export async function getConflicts() {
  const userId = await requireUser();

  return prisma.conflictCase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createConflict(data: ConflictInput) {
  const userId = await requireUser();

  const parsed = conflictSchema.parse(data);

  // Generate content using mock templates
  const generatedMessage = generateCalmMessage(parsed.topic, parsed.goal);
  const nvcMessage = generateNVCMessage(parsed.topic);
  const nextSteps = generateNextSteps(parsed.goal);

  const conflict = await prisma.conflictCase.create({
    data: {
      userId,
      topic: parsed.topic,
      intensity: parsed.intensity,
      goal: parsed.goal,
      generatedMessage,
      nvcMessage,
      nextSteps,
    },
  });

  revalidatePath("/conflicts");
  return conflict;
}

const updateConflictSchema = z.object({
  resolutionNotes: z.string().optional(),
  learnings: z.array(z.string()).optional(),
});

export async function updateConflict(
  id: string,
  data: { resolutionNotes?: string; learnings?: string[] },
) {
  const userId = await requireUser();

  const parsed = updateConflictSchema.parse(data);

  // Verify ownership
  const existing = await prisma.conflictCase.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Conflict not found");

  const conflict = await prisma.conflictCase.update({
    where: { id },
    data: {
      ...(parsed.resolutionNotes !== undefined && {
        resolutionNotes: parsed.resolutionNotes,
      }),
      ...(parsed.learnings !== undefined && {
        learnings: parsed.learnings,
      }),
    },
  });

  revalidatePath("/conflicts");
  return conflict;
}
