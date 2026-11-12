import { describe, it, expect } from "vitest";
import { predictAdmissions } from "../src/services/predictor.service";

describe("Admissions Predictor Engine", () => {
  it("should predict High probability for top TS EAMCET ranks in CSE", () => {
    const prediction = predictAdmissions({
      entranceExam: "TS EAMCET",
      entranceRank: 3500,
      twelfthPercentage: 92.5,
      category: "General",
    });

    expect(prediction).toBeDefined();
    expect(prediction.overallEligibility).toBeDefined();
    expect(prediction.predictions.length).toBeGreaterThan(0);

    const cse = prediction.predictions.find((p) => p.id === "btech-cse");
    expect(cse).toBeDefined();
    expect(cse?.probability).toBe("High");
    expect(cse?.matchPercentage).toBeGreaterThanOrEqual(80);
    expect(cse?.quotaType).toBe("Convenor Quota (Govt. Fee)");
  });

  it("should suggest Management Quota for ranks beyond convenor cutoffs", () => {
    const prediction = predictAdmissions({
      entranceExam: "TS EAMCET",
      entranceRank: 75000,
      twelfthPercentage: 82.0,
      category: "General",
    });

    const cse = prediction.predictions.find((p) => p.id === "btech-cse");
    expect(cse).toBeDefined();
    expect(cse?.quotaType).toBe("Management Quota");
  });

  it("should predict MBA eligibility based on ICET or Graduation criteria", () => {
    const prediction = predictAdmissions({
      entranceExam: "TS ICET",
      entranceRank: 6000,
      twelfthPercentage: 75.0,
      category: "General",
    });

    const mba = prediction.predictions.find((p) => p.id === "mba");
    expect(mba).toBeDefined();
    expect(mba?.category).toBe("MBA");
  });
});
