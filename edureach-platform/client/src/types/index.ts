export type UserRole = "student" | "faculty" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  department?: string;
  facultyId?: string;
  designation?: string;
  qualification?: string;
  officeHours?: string;
  profilePhoto?: string;
  is2FAEnabled?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface CourseData {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  instructor: string;
}

