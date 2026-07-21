import { useState } from "react";

import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Dashboard from "./pages/Dashboard";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceHistory from "./pages/InvoiceHistory";

type Page = "dashboard" | "analytics" | "history" | "detail";

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  if (page === "analytics") return <AnalyticsDashboard onNavigate={setPage} />;
  if (page === "history") return <InvoiceHistory onNavigate={setPage} onOpenInvoice={(id) => { setSelectedInvoiceId(id); setPage("detail"); }} />;
  if (page === "detail" && selectedInvoiceId !== null) return <InvoiceDetail invoiceId={selectedInvoiceId} onNavigate={setPage} />;

  return <Dashboard onNavigate={setPage} />;
}

export default App;
