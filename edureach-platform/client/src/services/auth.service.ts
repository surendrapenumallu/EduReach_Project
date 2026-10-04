import API from "./api";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "student" | "faculty" | "admin";
  department?: string;
  facultyId?: string;
}) => {
  const res = await API.post("/auth/register", data);
  return res.data.data; // { token, user }
};

export const loginUser = async (data: {
  email: string;
  password: string;
  role?: "student" | "faculty" | "admin";
}) => {
  const res = await API.post("/auth/login", data);
  return res.data.data; // { token, user }
};

export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data.data; // { user }
};

export const forgotPassword = async (email: string) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

export const verifyOtp = async (data: { email: string; otp: string; newPassword: string }) => {
  const res = await API.post("/auth/verify-otp", data);
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await API.put("/auth/update-profile", data);
  return res.data.data;
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const res = await API.post("/auth/change-password", data);
  return res.data;
};

export const toggle2FA = async (enable: boolean) => {
  const res = await API.post("/auth/toggle-2fa", { enable });
  return res.data.data;
};
