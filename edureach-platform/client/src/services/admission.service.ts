import API from "./api";

export interface AdmissionDocumentPayload {
  documentName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface AdmissionApplicationPayload {
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth?: string;
  gender: string;
  course: string;
  previousEducation: string;
  academicPercentage: number;
  address: string;
  admissionSession?: string;
  documents?: AdmissionDocumentPayload[];
}

export interface AdmissionApplicationData {
  _id: string;
  applicationId: string;
  userId: any;
  admissionSession: string;
  course: string;
  applicationDetails: {
    fullName: string;
    email: string;
    mobile: string;
    dateOfBirth?: string;
    gender: string;
    previousEducation: string;
    academicPercentage: number;
    address: string;
  };
  documents: Array<{
    _id?: string;
    documentName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
    uploadedAt: string;
  }>;
  status: "Submitted" | "Under Review" | "Documents Required" | "Shortlisted" | "Approved" | "Rejected";
  adminRemarks?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  _id: string;
  applicationId: string;
  previousStatus: string;
  newStatus: string;
  remarks?: string;
  updatedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  updatedAt: string;
}

// Student APIs
export const applyForAdmission = async (data: AdmissionApplicationPayload) => {
  const res = await API.post("/admissions/apply", data);
  return res.data;
};

export const getMyAdmissionApplication = async () => {
  const res = await API.get("/admissions/my-application");
  return res.data.data; // { application, history, profile }
};

export const getApplicationById = async (applicationId: string) => {
  const res = await API.get(`/admissions/${applicationId}`);
  return res.data.data; // { application, history, documents }
};

export const getApplicationStatus = async (applicationId: string) => {
  const res = await API.get(`/admissions/${applicationId}/status`);
  return res.data.data;
};

export const uploadAdditionalDocuments = async (
  applicationId: string,
  documents: AdmissionDocumentPayload[]
) => {
  const res = await API.post(`/admissions/${applicationId}/documents`, { documents });
  return res.data;
};

// Admin APIs
export const getAdminAdmissions = async (params: {
  page?: number;
  limit?: number;
  session?: string;
  course?: string;
  status?: string;
  search?: string;
}) => {
  const res = await API.get("/admin/admissions", { params });
  return res.data.data; // { applications, stats, pagination }
};

export const getAdminAdmissionById = async (applicationId: string) => {
  const res = await API.get(`/admin/admissions/${applicationId}`);
  return res.data.data; // { application, history, documents, profile }
};

export const updateAdminAdmissionStatus = async (
  applicationId: string,
  status: string,
  remarks?: string
) => {
  const res = await API.patch(`/admin/admissions/${applicationId}/status`, { status, remarks });
  return res.data;
};

export const updateAdminAdmissionRemarks = async (applicationId: string, remarks: string) => {
  const res = await API.patch(`/admin/admissions/${applicationId}/remarks`, { remarks });
  return res.data;
};

export const getAdminAdmissionStatistics = async () => {
  const res = await API.get("/admin/admissions/statistics");
  return res.data.data;
};

