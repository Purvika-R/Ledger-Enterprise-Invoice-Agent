import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, FileText, Sparkles } from "lucide-react";

import AuditTrailCard from "../components/dashboard/AuditTrailCard";
import StatusCard from "../components/dashboard/StatusCard";
import Header from "../components/layout/Header";
import UploadCard from "../components/upload/UploadCard";
import { useAuth } from "../context/AuthContext";
import { validateHeaderAndLineItems } from "../utils/validation";

type Props = { onNavigate?: (page: "dashboard" | "analytics" | "history") => void };

export default function Dashboard({ onNavigate }: Props) {
  const { user } = useAuth();
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);
  const [reviewedHeader, setReviewedHeader] = useState<any>(null);
  const [reviewedLineItems, setReviewedLineItems] = useState<any[]>([]);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("http://127.0.0.1:8000/progress");
    eventSource.onmessage = (event) => setProgress((previous) => [...previous, JSON.parse(event.data)]);
    eventSource.onerror = () => console.log("SSE disconnected");
    return () => eventSource.close();
  }, []);

  useEffect(() => {
    if (!invoiceData) { setReviewedHeader(null); setReviewedLineItems([]); setApproved(false); return; }
    setReviewedHeader({ ...invoiceData.header });
    setReviewedLineItems((invoiceData.line_items || []).map((item: any) => ({ ...item })));
    setApproved(false);
  }, [invoiceData]);

  const liveFieldValidation = useMemo(() => reviewedHeader ? validateHeaderAndLineItems(reviewedHeader, reviewedLineItems) : null, [reviewedHeader, reviewedLineItems]);
  const completedAgents = progress.filter((event) => event.status === "completed").length;
  const statistics = [
    { label: "Workspace status", value: processing ? "Processing" : "Ready", icon: Activity, tone: processing ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50" },
    { label: "Pipeline stages", value: processing ? `${completedAgents} completed` : invoiceData ? "Complete" : "Awaiting upload", icon: Sparkles, tone: "text-indigo-600 bg-indigo-50" },
    { label: "Validation", value: invoiceData ? (invoiceData.validation_passed ? "Passed" : "Review needed") : "—", icon: CheckCircle2, tone: "text-blue-600 bg-blue-50" },
    { label: "Current invoice", value: invoiceData?.header?.invoice_number || "None", icon: FileText, tone: "text-slate-600 bg-slate-100" },
  ];

  return <div className="min-h-screen"><Header activePage="dashboard" onNavigate={onNavigate} /><main className="mx-auto max-w-7xl px-4 py-6 sm:px-7 sm:py-8"><motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex flex-col justify-between gap-5 rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/70 p-6 shadow-[0_18px_50px_-32px_rgba(30,41,59,0.45)] sm:p-8 lg:flex-row lg:items-end"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600"><Sparkles size={14} /> Ledger intelligence</p><h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Welcome back, {user?.name?.split(" ")[0] || "there"}.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Process, validate, and review invoices with a clear audit trail at every decision point.</p></div><div className="flex items-center gap-2 rounded-2xl border border-white bg-white/80 px-4 py-3 text-sm shadow-sm"><span className={`h-2 w-2 rounded-full ${processing ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`} /><span className="font-medium text-slate-700">{processing ? "Pipeline in progress" : "Workspace ready"}</span></div></motion.section><section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{statistics.map(({ label, value, icon: Icon, tone }, index) => <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="premium-card flex items-center gap-3 rounded-2xl p-4"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></div><div className="min-w-0"><p className="text-xs font-medium text-slate-500">{label}</p><p className="truncate text-sm font-semibold text-slate-900">{value}</p></div></motion.div>)}</section><section className="grid items-start gap-6 xl:grid-cols-[minmax(340px,0.8fr)_minmax(0,1.35fr)]"><UploadCard onProcessed={setInvoiceData} setProcessing={setProcessing} clearProgress={() => setProgress([])} /><StatusCard data={invoiceData} processing={processing} progress={progress} reviewedHeader={reviewedHeader} reviewedLineItems={reviewedLineItems} liveFieldValidation={liveFieldValidation} approved={approved} onHeaderFieldChange={(field, value) => setReviewedHeader((previous: any) => ({ ...previous, [field]: value }))} onLineItemChange={(index, field, value) => setReviewedLineItems((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))} onApprove={() => setApproved(true)} onUploadAnother={() => setInvoiceData(null)} /></section><section id="audit-trail" className="mt-6"><AuditTrailCard auditTrail={invoiceData?.audit_trail ?? []} result={invoiceData} /></section></main></div>;
}
