import { describe, it, expect } from "vitest";

// Attendance Bunk Safety Calculation Logic
function computeBunkSafety(total: number, attended: number, minThreshold = 75) {
  const currentPct = (attended / total) * 100;
  if (currentPct >= minThreshold) {
    // How many more can be missed: attended / (total + x) >= 0.75
    // attended >= 0.75 * total + 0.75 * x
    // 0.75 * x <= attended - 0.75 * total
    // x = floor((attended - 0.75 * total) / 0.75)
    const safeBunks = Math.floor((attended - (minThreshold / 100) * total) / (minThreshold / 100));
    return { isEligible: true, safeBunks: Math.max(0, safeBunks), requiredClasses: 0 };
  } else {
    // How many consecutive classes must be attended: (attended + y) / (total + y) >= 0.75
    // attended + y >= 0.75 * total + 0.75 * y
    // 0.25 * y >= 0.75 * total - attended
    // y = ceil((0.75 * total - attended) / 0.25)
    const requiredClasses = Math.ceil(
      ((minThreshold / 100) * total - attended) / (1 - minThreshold / 100)
    );
    return { isEligible: false, safeBunks: 0, requiredClasses: Math.max(1, requiredClasses) };
  }
}

describe("Attendance Bunk Safety Intelligence Engine", () => {
  it("should calculate safe bunks correctly when attendance is above 75%", () => {
    // 44 attended out of 48 total = 91.6%
    const result = computeBunkSafety(48, 44, 75);
    expect(result.isEligible).toBe(true);
    expect(result.safeBunks).toBeGreaterThan(0);
    expect(result.requiredClasses).toBe(0);

    // Verify: after missing safeBunks classes, attendance must still be >= 75%
    const newTotal = 48 + result.safeBunks;
    const newPct = (44 / newTotal) * 100;
    expect(newPct).toBeGreaterThanOrEqual(75.0);
  });

  it("should calculate required recovery classes when attendance is below 75%", () => {
    // 28 attended out of 40 total = 70.0%
    const result = computeBunkSafety(40, 28, 75);
    expect(result.isEligible).toBe(false);
    expect(result.safeBunks).toBe(0);
    expect(result.requiredClasses).toBeGreaterThan(0);

    // Verify: after attending requiredClasses, attendance must reach >= 75%
    const newTotal = 40 + result.requiredClasses;
    const newAttended = 28 + result.requiredClasses;
    const newPct = (newAttended / newTotal) * 100;
    expect(newPct).toBeGreaterThanOrEqual(75.0);
  });
});
