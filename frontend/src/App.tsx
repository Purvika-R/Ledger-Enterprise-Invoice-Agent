import { useState } from "react";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { loading } = useAuth();
  const [authPage, setAuthPage] = useState<"login" | "register">("login");

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Loading...</div>;
  }

  const authScreen = authPage === "login"
    ? <LoginPage onRegister={() => setAuthPage("register")} />
    : <RegisterPage onLogin={() => setAuthPage("login")} />;

  return <ProtectedRoute unauthenticated={authScreen}><Dashboard /></ProtectedRoute>;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
