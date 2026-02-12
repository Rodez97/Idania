import { describe, it, expect } from "vitest";
import { generateSuggestions } from "@/lib/suggestions";

describe("suggestions engine", () => {
  it("should always return at least 3 suggestions", () => {
    const suggestions = generateSuggestions({
      mood: "ok",
      upcomingEventsCount: 0,
      hasPartnerProfile: false,
      recentConflicts: 0,
    });
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
  });

  it("should include micro-gesture, small-plan, and pro-plan", () => {
    const suggestions = generateSuggestions({
      mood: "great",
      upcomingEventsCount: 2,
      hasPartnerProfile: true,
      recentConflicts: 0,
    });
    const types = suggestions.map((s) => s.type);
    expect(types).toContain("micro-gesture");
    expect(types).toContain("small-plan");
    expect(types).toContain("pro-plan");
  });

  it("should add bridge question when mood is tense", () => {
    const suggestions = generateSuggestions({
      mood: "tense",
      upcomingEventsCount: 0,
      hasPartnerProfile: false,
      recentConflicts: 1,
    });
    const types = suggestions.map((s) => s.type);
    expect(types).toContain("bridge-question");
  });

  it("should add bridge question when mood is distant", () => {
    const suggestions = generateSuggestions({
      mood: "distant",
      upcomingEventsCount: 0,
      hasPartnerProfile: false,
      recentConflicts: 0,
    });
    const types = suggestions.map((s) => s.type);
    expect(types).toContain("bridge-question");
  });

  it("should not add bridge question for great mood", () => {
    const suggestions = generateSuggestions({
      mood: "great",
      upcomingEventsCount: 0,
      hasPartnerProfile: false,
      recentConflicts: 0,
    });
    const types = suggestions.map((s) => s.type);
    expect(types).not.toContain("bridge-question");
  });

  it("should handle null mood as ok", () => {
    const suggestions = generateSuggestions({
      mood: null,
      upcomingEventsCount: 0,
      hasPartnerProfile: false,
      recentConflicts: 0,
    });
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
  });

  it("should have emoji in each suggestion", () => {
    const suggestions = generateSuggestions({
      mood: "ok",
      upcomingEventsCount: 0,
      hasPartnerProfile: false,
      recentConflicts: 0,
    });
    for (const s of suggestions) {
      expect(s.emoji).toBeDefined();
      expect(s.emoji.length).toBeGreaterThan(0);
    }
  });
});
