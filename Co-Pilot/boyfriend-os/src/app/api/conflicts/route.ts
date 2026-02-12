import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";
import { z } from "zod/v4";
import { conflictSchema } from "@/lib/validations";

const CALM_TEMPLATES: Record<string, string[]> = {
  repair: [
    "Entiendo que esto ha sido dificil. Quiero que sepamos que podemos resolverlo juntos con respeto y honestidad.",
    "Lo que paso nos afecto a los dos. Me gustaria que hablaramos con calma para reparar lo que se rompio.",
    "Se que la situacion no fue facil. Quiero escucharte y encontrar una forma de avanzar juntos.",
  ],
  clarify: [
    "Creo que hubo un malentendido y me gustaria que lo aclaremos con calma. Tu perspectiva es importante para mi.",
    "Quiero asegurarme de que nos entendemos bien. ¿Podemos hablar de lo que paso sin presiones?",
    "A veces las cosas no se entienden como las queremos decir. Me gustaria escuchar tu version.",
  ],
  boundary: [
    "Necesito compartir contigo algo importante sobre mis limites. Lo hago desde el respeto y el amor.",
    "Quiero ser honesto/a contigo sobre algo que necesito. Espero que podamos hablarlo con apertura.",
    "Hay algo que necesito expresar sobre mis necesidades. Lo digo con respeto porque me importas.",
  ],
};

function generateCalmMessage(goal: string, topic: string): string {
  const templates = CALM_TEMPLATES[goal] || CALM_TEMPLATES.repair;
  const template = templates[Math.floor(Math.random() * templates.length)];
  return `${template} Sobre: ${topic}`;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conflicts = await prisma.conflictCase.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(conflicts);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = conflictSchema.parse(body);

    const calmMessage = generateCalmMessage(data.goal, data.topic);

    const conflict = await prisma.conflictCase.create({
      data: {
        userId: session.user.id,
        topic: data.topic,
        intensity: data.intensity,
        goal: data.goal,
        generatedMessage: calmMessage,
      },
    });

    return NextResponse.json(conflict, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
