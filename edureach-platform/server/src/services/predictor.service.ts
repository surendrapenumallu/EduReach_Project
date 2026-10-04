export interface PredictionInput {
  entranceExam: string;
  entranceRank?: number;
  twelfthPercentage: number;
  category?: string;
}

export interface BranchPrediction {
  id: string;
  branchName: string;
  category: "B.Tech" | "M.Tech" | "MBA";
  probability: "High" | "Moderate" | "Low";
  matchPercentage: number;
  quotaType: "Convenor Quota (Govt. Fee)" | "Management Quota";
  closingRankBenchmark: string;
  recommendationReason: string;
}

export interface PredictionResult {
  input: PredictionInput;
  overallEligibility: string;
  recommendedBranch: string;
  aiCounselorInsight: string;
  predictions: BranchPrediction[];
}

interface BranchRule {
  id: string;
  name: string;
  category: "B.Tech" | "M.Tech" | "MBA";
  eamcetClosingRank: number;
  jeePercentileCutoff: number;
  icetClosingRank?: number;
}

const BRANCH_RULES: BranchRule[] = [
  { id: "btech-cse", name: "B.Tech - Computer Science & Engineering (CSE)", category: "B.Tech", eamcetClosingRank: 7800, jeePercentileCutoff: 92 },
  { id: "btech-aids", name: "B.Tech - Artificial Intelligence & Data Science (AI & DS)", category: "B.Tech", eamcetClosingRank: 11500, jeePercentileCutoff: 88 },
  { id: "btech-it", name: "B.Tech - Information Technology (IT)", category: "B.Tech", eamcetClosingRank: 14200, jeePercentileCutoff: 85 },
  { id: "btech-ece", name: "B.Tech - Electronics & Communication Engineering (ECE)", category: "B.Tech", eamcetClosingRank: 18500, jeePercentileCutoff: 82 },
  { id: "btech-me", name: "B.Tech - Mechanical Engineering (ME)", category: "B.Tech", eamcetClosingRank: 36000, jeePercentileCutoff: 75 },
  { id: "btech-ce", name: "B.Tech - Civil Engineering (CE)", category: "B.Tech", eamcetClosingRank: 42000, jeePercentileCutoff: 70 },
  { id: "mba", name: "MBA (Finance, Marketing, HR, IT)", category: "MBA", eamcetClosingRank: 0, jeePercentileCutoff: 0, icetClosingRank: 12500 },
];

export const predictAdmissions = (input: PredictionInput): PredictionResult => {
  const rank = input.entranceRank || 0;
  const pct = input.twelfthPercentage;
  const exam = input.entranceExam || "TS EAMCET";

  const predictions: BranchPrediction[] = BRANCH_RULES.map((rule) => {
    let probability: "High" | "Moderate" | "Low" = "Low";
    let matchPercentage = 40;
    let quotaType: "Convenor Quota (Govt. Fee)" | "Management Quota" = "Management Quota";
    let closingRankBenchmark = "Direct Management Quota Seats Available";
    let recommendationReason = "";

    if (exam === "TS EAMCET" && rank > 0 && rule.eamcetClosingRank > 0) {
      closingRankBenchmark = `EAMCET Cutoff: Rank ~${rule.eamcetClosingRank.toLocaleString()}`;
      if (rank <= rule.eamcetClosingRank) {
        probability = "High";
        const margin = ((rule.eamcetClosingRank - rank) / rule.eamcetClosingRank) * 100;
        matchPercentage = Math.min(98, Math.round(85 + margin * 0.2));
        quotaType = "Convenor Quota (Govt. Fee)";
        recommendationReason = `Your rank of #${rank.toLocaleString()} comfortably passes the expected TS EAMCET cutoff of #${rule.eamcetClosingRank.toLocaleString()}.`;
      } else if (rank <= rule.eamcetClosingRank * 1.3) {
        probability = "Moderate";
        matchPercentage = Math.round(65 + Math.random() * 10);
        quotaType = "Convenor Quota (Govt. Fee)";
        recommendationReason = `Your rank is slightly above the closing cutoff, but high probability in Phase 2 or Mop-Up counseling round.`;
      } else {
        probability = "Low";
        matchPercentage = 45;
        quotaType = "Management Quota";
        recommendationReason = `Rank exceeds convenor cutoff. Eligible under Category-B Management Quota with 12th marks (${pct}%).`;
      }
    } else if (exam === "JEE Main") {
      // Rank treated as percentile or rank
      const percentile = rank <= 100 ? rank : Math.max(0, 100 - (rank / 1200000) * 100);
      closingRankBenchmark = `JEE Cutoff: ${rule.jeePercentileCutoff} Percentile`;
      if (percentile >= rule.jeePercentileCutoff) {
        probability = "High";
        matchPercentage = Math.min(96, Math.round(85 + (percentile - rule.jeePercentileCutoff) * 2));
        quotaType = "Convenor Quota (Govt. Fee)";
        recommendationReason = `Your JEE Main percentile of ${percentile.toFixed(1)} exceeds the required ${rule.jeePercentileCutoff} percentile benchmark.`;
      } else if (percentile >= rule.jeePercentileCutoff - 5) {
        probability = "Moderate";
        matchPercentage = 70;
        quotaType = "Convenor Quota (Govt. Fee)";
        recommendationReason = `Competitive score for spot round allotment.`;
      } else {
        probability = "Low";
        matchPercentage = 40;
        quotaType = "Management Quota";
        recommendationReason = `Direct admission available based on your 12th percentage (${pct}%).`;
      }
    } else if (exam === "ICET" && rule.icetClosingRank) {
      closingRankBenchmark = `ICET Cutoff: Rank ~${rule.icetClosingRank.toLocaleString()}`;
      if (rank > 0 && rank <= rule.icetClosingRank) {
        probability = "High";
        matchPercentage = 92;
        quotaType = "Convenor Quota (Govt. Fee)";
        recommendationReason = `Your TS ICET rank #${rank.toLocaleString()} qualifies for MBA Convenor quota.`;
      } else {
        probability = "Moderate";
        matchPercentage = 68;
        quotaType = "Management Quota";
        recommendationReason = `Direct MBA admission based on Graduation/12th percentage.`;
      }
    } else {
      // Direct / 12th percentage based
      if (pct >= 85) {
        probability = "High";
        matchPercentage = 92;
        quotaType = "Management Quota";
        recommendationReason = `Strong 12th Board score (${pct}%) qualifies for direct merit scholarship admission.`;
      } else if (pct >= 60) {
        probability = "Moderate";
        matchPercentage = 75;
        quotaType = "Management Quota";
        recommendationReason = `Eligible for direct admission across available seat seats.`;
      } else {
        probability = "Low";
        matchPercentage = 50;
        quotaType = "Management Quota";
        recommendationReason = `Requires special counseling evaluation by admissions committee.`;
      }
    }

    return {
      id: rule.id,
      branchName: rule.name,
      category: rule.category,
      probability,
      matchPercentage,
      quotaType,
      closingRankBenchmark,
      recommendationReason,
    };
  });

  const highChances = predictions.filter((p) => p.probability === "High");
  const topBranch = highChances.length > 0 ? highChances[0].branchName : predictions[0].branchName;

  let aiCounselorInsight = "";
  if (pct >= 90 || (rank > 0 && rank <= 8000)) {
    aiCounselorInsight = `Outstanding academic profile! With a 12th score of ${pct}% and exam performance, you are in the top tier of applicants for EduReach College. You are eligible for a Merit Scholarship up to 50% tuition waiver in CSE / AI&DS.`;
  } else if (pct >= 75 || (rank > 0 && rank <= 20000)) {
    aiCounselorInsight = `Great candidate profile! You have strong chances for B.Tech AI & DS, ECE, and IT under Convenor Quota. We recommend applying early to secure your preferred branch choice.`;
  } else {
    aiCounselorInsight = `Good foundational profile. While core branches like CSE have tight convenor cutoffs, you qualify for Management Quota merit seats across all programs.`;
  }

  return {
    input,
    overallEligibility: highChances.length > 0 ? "High Admission Eligibility" : "Moderate Eligibility",
    recommendedBranch: topBranch,
    aiCounselorInsight,
    predictions,
  };
};
