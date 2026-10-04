import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PredictorPage from "./pages/PredictorPage";
import StudentResultsPage from "./pages/StudentResultsPage";
import FacultyDashboard from "./pages/FacultyDashboard";
import Navbar from "./components/Navbar";
import FloatingChatButton from "./components/FloatingChatButton";

const WithNavbar = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route
            path="/"
            element={
              <WithNavbar>
                <HomePage />
              </WithNavbar>
            }
          />
          <Route
            path="/predictor"
            element={
              <WithNavbar>
                <PredictorPage />
              </WithNavbar>
            }
          />
          <Route
            path="/results"
            element={
              <WithNavbar>
                <StudentResultsPage />
              </WithNavbar>
            }
          />
          <Route
            path="/dashboard"
            element={
              <WithNavbar>
                <StudentDashboard />
              </WithNavbar>
            }
          />
          <Route
            path="/faculty"
            element={
              <WithNavbar>
                <FacultyDashboard />
              </WithNavbar>
            }
          />
          <Route
            path="/admin"
            element={
              <WithNavbar>
                <AdminDashboard />
              </WithNavbar>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        <FloatingChatButton />
      </AuthProvider>
    </BrowserRouter>
  );
}
