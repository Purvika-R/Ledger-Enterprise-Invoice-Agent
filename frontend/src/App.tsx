import { useState, type ReactNode } from "react";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedLayout, { type AppPage } from "./components/layout/ProtectedLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Dashboard from "./pages/Dashboard";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceHistory from "./pages/InvoiceHistory";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

function AppContent() {
  const { loading } = useAuth();
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [page, setPage] = useState<AppPage>("dashboard");
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Loading...</div>;
  }

  const authScreen = authPage === "login"
    ? <LoginPage onRegister={() => setAuthPage("register")} />
    : <RegisterPage onLogin={() => setAuthPage("login")} />;

  function navigate(nextPage: AppPage | "audit") {
    if (nextPage === "audit") {
      setPage("dashboard");
      window.requestAnimationFrame(() => document.getElementById("audit-trail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }

    setInvoiceId(null);
    setPage(nextPage);
  }

  let currentPage: ReactNode;
  if (invoiceId !== null) {
    currentPage = <InvoiceDetail invoiceId={invoiceId} onNavigate={navigate} />;
  } else if (page === "analytics") {
    currentPage = <AnalyticsDashboard onNavigate={navigate} />;
  } else if (page === "history") {
    currentPage = <InvoiceHistory onNavigate={navigate} onOpenInvoice={setInvoiceId} />;
  } else if (page === "profile") {
    currentPage = <ProfilePage />;
  } else {
    currentPage = <Dashboard onNavigate={navigate} />;
  }

  return <ProtectedRoute unauthenticated={authScreen}><ProtectedLayout activePage={invoiceId === null ? page : "history"} onNavigate={navigate}>{currentPage}</ProtectedLayout></ProtectedRoute>;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
