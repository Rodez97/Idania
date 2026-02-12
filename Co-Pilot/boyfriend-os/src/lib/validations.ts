import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dateTime: z.string().min(1, "Date is required"),
  category: z.string().default("general"),
  notes: z.string().optional(),
  reminders: z.array(z.object({
    offsetMinutes: z.number().int().min(0),
    channel: z.enum(["inApp", "push"]).default("inApp"),
  })).default([]),
});

export const journalSchema = z.object({
  happenedAt: z.string().optional(),
  mood: z.enum(["ok", "distant", "tense", "great"]),
  tags: z.array(z.string()).default([]),
  what: z.string().min(1, "What happened is required"),
  feelings: z.string().optional(),
  outcome: z.string().optional(),
});

export const assistantSchema = z.object({
  context: z.string().min(1, "Context is required"),
  intent: z.string().min(1, "Intent is required"),
});

export const conflictSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  intensity: z.number().int().min(1).max(10).default(5),
  goal: z.enum(["repair", "clarify", "boundary"]).default("repair"),
});

export const moodSchema = z.object({
  mood: z.enum(["ok", "distant", "tense", "great"]),
});

export const profileSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  loveLanguages: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  calmers: z.array(z.string()).default([]),
  preferences: z.record(z.string(), z.unknown()).default({}),
  boundaries: z.array(z.string()).default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type JournalInput = z.infer<typeof journalSchema>;
export type AssistantInput = z.infer<typeof assistantSchema>;
export type ConflictInput = z.infer<typeof conflictSchema>;
export type MoodInput = z.infer<typeof moodSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
