import API from "./api";

export interface ApplicationDocuments {
  marksheet?: string;
  rankCard?: string;
  idProof?: string;
}

export interface ApplicationData {
  _id: string;
  studentName: string;
  email: string;
  phone: string;
  course: string;
  twelfthPercentage: number;
  entranceExam: string;
  entranceRank?: string;
  status: "Pending" | "Under Review" | "Accepted" | "Rejected";
  documents?: ApplicationDocuments;
  created_at: string;
}

export const submitApplication = async (data: {
  studentName: string;
  email: string;
  phone: string;
  course: string;
  twelfthPercentage: number;
  entranceExam?: string;
  entranceRank?: string;
  documents?: ApplicationDocuments;
}) => {
  const res = await API.post("/applications", data);
  return res.data;
};

export const getMyApplications = async (): Promise<ApplicationData[]> => {
  const res = await API.get("/applications/my");
  return res.data.data.applications;
};

export const getAllApplications = async (): Promise<{
  count: number;
  stats: {
    total: number;
    pending: number;
    underReview: number;
    accepted: number;
    rejected: number;
  };
  applications: ApplicationData[];
}> => {
  const res = await API.get("/applications/all");
  return res.data.data;
};

export const updateApplicationStatus = async (id: string, status: string) => {
  const res = await API.patch(`/applications/${id}/status`, { status });
  return res.data;
};

export const deleteApplication = async (id: string) => {
  const res = await API.delete(`/applications/${id}`);
  return res.data;
};
