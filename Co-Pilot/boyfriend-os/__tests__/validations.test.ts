import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  eventSchema,
  journalSchema,
  moodSchema,
  conflictSchema,
} from "@/lib/validations";

describe("validations", () => {
  describe("loginSchema", () => {
    it("should accept valid email and password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({ email: "invalid", password: "123456" });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "123" });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should accept matching passwords", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "123456",
        confirmPassword: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-matching passwords", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "123456",
        confirmPassword: "654321",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("eventSchema", () => {
    it("should accept valid event", () => {
      const result = eventSchema.safeParse({
        title: "Test Event",
        dateTime: "2026-03-15T10:00",
        category: "date",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = eventSchema.safeParse({
        title: "",
        dateTime: "2026-03-15T10:00",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("journalSchema", () => {
    it("should accept valid journal entry", () => {
      const result = journalSchema.safeParse({
        mood: "great",
        what: "Had a great day together",
        tags: ["love", "quality-time"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid mood", () => {
      const result = journalSchema.safeParse({
        mood: "invalid",
        what: "Something happened",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("moodSchema", () => {
    it("should accept valid moods", () => {
      for (const mood of ["ok", "distant", "tense", "great"]) {
        const result = moodSchema.safeParse({ mood });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid mood", () => {
      const result = moodSchema.safeParse({ mood: "angry" });
      expect(result.success).toBe(false);
    });
  });

  describe("conflictSchema", () => {
    it("should accept valid conflict", () => {
      const result = conflictSchema.safeParse({
        topic: "Weekend plans disagreement",
        intensity: 7,
        goal: "repair",
      });
      expect(result.success).toBe(true);
    });

    it("should reject intensity out of range", () => {
      const result = conflictSchema.safeParse({
        topic: "Test",
        intensity: 15,
        goal: "repair",
      });
      expect(result.success).toBe(false);
    });
  });
});
