import API from "./api";

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
  input: {
    entranceExam: string;
    entranceRank?: number;
    twelfthPercentage: number;
    category?: string;
  };
  overallEligibility: string;
  recommendedBranch: string;
  aiCounselorInsight: string;
  predictions: BranchPrediction[];
}

export const getAdmissionPrediction = async (data: {
  entranceExam: string;
  entranceRank?: number;
  twelfthPercentage: number;
  category?: string;
}): Promise<PredictionResult> => {
  const res = await API.post("/predictor/predict", data);
  return res.data.data;
};
