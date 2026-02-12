import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("demo123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@boyfriendos.com" },
    update: {},
    create: {
      email: "demo@boyfriendos.com",
      passwordHash,
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create partner profile
  await prisma.partnerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      displayName: "Mi Pareja",
      loveLanguages: ["Palabras de afirmacion", "Tiempo de calidad"],
      triggers: ["Sentirse ignorada", "Falta de comunicacion"],
      calmers: ["Escucha activa", "Contacto fisico", "Palabras de apoyo"],
      preferences: { morningPerson: true, lovesFlowers: true },
      boundaries: ["No revisar el telefono", "Respetar espacio personal"],
    },
  });

  // Create sample events
  const now = new Date();
  const events = [
    {
      userId: user.id,
      title: "Aniversario",
      dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      category: "anniversary",
      notes: "3 anos juntos! Reservar restaurante favorito.",
    },
    {
      userId: user.id,
      title: "Cumpleanos de su mama",
      dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      category: "family",
      notes: "Comprar regalo. Le gustan las plantas.",
    },
    {
      userId: user.id,
      title: "Cita de cafe",
      dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      category: "date",
      notes: "Cafe nuevo en el centro.",
    },
    {
      userId: user.id,
      title: "Noche de pelis",
      dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      category: "date",
      notes: "Ver esa pelicula que ella queria.",
    },
  ];

  for (const event of events) {
    const created = await prisma.event.create({ data: event });
    // Add reminders
    await prisma.reminder.create({
      data: {
        eventId: created.id,
        offsetMinutes: 60 * 24 * 2, // 2 days before
        channel: "inApp",
      },
    });
    await prisma.reminder.create({
      data: {
        eventId: created.id,
        offsetMinutes: 0, // Same day
        channel: "push",
      },
    });
  }

  console.log(`Created ${events.length} events with reminders`);

  // Create sample journal entries
  const journalEntries = [
    {
      userId: user.id,
      happenedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      mood: "great" as const,
      tags: ["comunicacion", "conexion"],
      what: "Tuvimos una conversacion muy bonita sobre nuestros planes a futuro.",
      feelings: "Me senti muy conectado y esperanzado.",
      outcome: "Acordamos hacer un viaje juntos el proximo mes.",
    },
    {
      userId: user.id,
      happenedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      mood: "tense" as const,
      tags: ["conflicto", "resolucion"],
      what: "Discutimos por los planes del fin de semana.",
      feelings: "Frustrado al principio, pero luego aliviado.",
      outcome: "Encontramos un compromiso que funciono para los dos.",
    },
    {
      userId: user.id,
      happenedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      mood: "ok" as const,
      tags: ["rutina", "dia normal"],
      what: "Dia tranquilo. Cenamos juntos y vimos una serie.",
      feelings: "En calma, agradecido por la normalidad.",
      outcome: null,
    },
  ];

  for (const entry of journalEntries) {
    await prisma.journalEntry.create({ data: entry });
  }

  console.log(`Created ${journalEntries.length} journal entries`);

  // Create initial mood
  await prisma.moodEntry.create({
    data: {
      userId: user.id,
      mood: "ok",
    },
  });

  console.log("Seed completed successfully!");
  console.log("Login with: demo@boyfriendos.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
