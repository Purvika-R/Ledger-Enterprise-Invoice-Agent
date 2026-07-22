import { BarChart3, ClipboardList, FileText, LayoutDashboard, ShieldCheck, UserRound, Users, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import type { AppPage } from "./ProtectedLayout";

type NavPage = AppPage | "audit";
type Props = { activePage: AppPage; open: boolean; onClose: () => void; onNavigate: (page: NavPage) => void };

export default function Sidebar({ activePage, open, onClose, onNavigate }: Props) {
  const { user } = useAuth();
  const isUploader = user?.role === "uploader";
  const isAdmin = user?.role === "admin";
  const items: { label: string; page?: NavPage; icon: typeof LayoutDashboard; visible: boolean }[] = [
    { label: "Overview", page: "dashboard", icon: LayoutDashboard, visible: true },
    { label: "Analytics", page: "analytics", icon: BarChart3, visible: !isUploader },
    { label: "Invoices", page: "history", icon: FileText, visible: true },
    { label: "Audit trail", page: "audit", icon: ClipboardList, visible: !isUploader },
    { label: "Profile", page: "profile", icon: UserRound, visible: true },
    { label: "User management", icon: Users, visible: isAdmin },
  ];

  function navigate(page?: NavPage) { if (page) { onNavigate(page); onClose(); } }

  return <>{open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden" />}<aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 px-4 py-5 text-slate-300 shadow-2xl transition-transform duration-300 lg:static lg:w-66 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="mb-9 flex items-center justify-between px-2"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/25"><ShieldCheck size={19} /></div><div><p className="font-semibold tracking-tight text-white">Ledger</p><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blue-300">Intelligence</p></div></div><button aria-label="Close navigation" onClick={onClose} className="rounded-lg p-2 transition hover:bg-white/10 lg:hidden"><X size={18} /></button></div><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Workspace</p><nav className="space-y-1">{items.filter((item) => item.visible).map(({ label, page, icon: Icon }) => { const active = page === activePage; return <button key={label} disabled={!page} title={page ? undefined : "User management is not available in this workspace yet."} onClick={() => navigate(page)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.75 text-left text-sm font-medium transition ${active ? "bg-white/12 text-white shadow-inner shadow-white/5" : "text-slate-400 hover:bg-white/7 hover:text-white"} disabled:cursor-not-allowed disabled:opacity-45`}><Icon size={18} className={active ? "text-blue-300" : "text-slate-500 transition group-hover:text-blue-300"} />{label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-300" />}</button>; })}</nav><div className="mt-auto rounded-2xl border border-white/8 bg-white/5 p-4"><p className="text-xs font-semibold text-white">Enterprise-ready processing</p><p className="mt-1 text-xs leading-5 text-slate-400">Secure extraction, validation, and auditability in one workspace.</p><div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Systems operational</div></div></aside></>;
}
