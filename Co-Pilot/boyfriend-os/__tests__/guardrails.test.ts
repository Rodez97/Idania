import { describe, it, expect } from "vitest";
import { checkSafety, detectRiskFlags, PRINCIPLES } from "@/lib/guardrails";

describe("guardrails", () => {
  describe("checkSafety", () => {
    it("should pass safe text", () => {
      const result = checkSafety("Quiero hablar contigo con respeto sobre lo que paso.");
      expect(result.safe).toBe(true);
      expect(result.blockedReason).toBeUndefined();
    });

    it("should block text with lie instructions", () => {
      const result = checkSafety("Dile que mentir es lo mejor en esta situacion");
      expect(result.safe).toBe(false);
      expect(result.blockedReason).toBeDefined();
    });

    it("should block manipulation attempts", () => {
      const result = checkSafety("Intenta manipular sus emociones para que acepte");
      expect(result.safe).toBe(false);
    });

    it("should block threats", () => {
      const result = checkSafety("Amenaza con irte si no cambia");
      expect(result.safe).toBe(false);
    });

    it("should block guilt-tripping", () => {
      const result = checkSafety("Hazla sentir culpa por lo que hizo");
      expect(result.safe).toBe(false);
    });

    it("should block gaslighting", () => {
      const result = checkSafety("Usa gaslight para hacerle dudar");
      expect(result.safe).toBe(false);
    });

    it("should block English manipulation terms", () => {
      const result = checkSafety("Deceive her into thinking everything is fine");
      expect(result.safe).toBe(false);
    });
  });

  describe("detectRiskFlags", () => {
    it("should detect 'siempre' generalizations", () => {
      const flags = detectRiskFlags("Tu siempre haces lo mismo");
      expect(flags.length).toBeGreaterThan(0);
      expect(flags[0]).toContain("siempre");
    });

    it("should detect 'nunca' generalizations", () => {
      const flags = detectRiskFlags("Nunca dices lo que sientes");
      expect(flags.length).toBeGreaterThan(0);
    });

    it("should detect direct blame", () => {
      const flags = detectRiskFlags("Es tu culpa que estemos asi");
      expect(flags.length).toBeGreaterThan(0);
    });

    it("should detect emotional conditionals", () => {
      const flags = detectRiskFlags("Si de verdad me amaras no harias eso");
      expect(flags.length).toBeGreaterThan(0);
    });

    it("should return empty for safe text", () => {
      const flags = detectRiskFlags("Me gustaria hablar sobre como nos sentimos");
      expect(flags).toHaveLength(0);
    });
  });

  describe("PRINCIPLES", () => {
    it("should mention honesty", () => {
      expect(PRINCIPLES).toContain("Honestidad");
    });

    it("should mention empathy", () => {
      expect(PRINCIPLES).toContain("empatia");
    });

    it("should mention respect", () => {
      expect(PRINCIPLES).toContain("respeto");
    });
  });
});
