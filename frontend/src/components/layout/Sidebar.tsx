import { BarChart3, ClipboardList, FileText, LayoutDashboard, ShieldCheck, UserRound, Users, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import type { AppPage } from "./ProtectedLayout";

type NavPage = AppPage | "audit";

type Props = {
  activePage: AppPage;
  open: boolean;
  onClose: () => void;
  onNavigate: (page: NavPage) => void;
};

export default function Sidebar({ activePage, open, onClose, onNavigate }: Props) {
  const { user } = useAuth();
  const isUploader = user?.role === "uploader";
  const isAdmin = user?.role === "admin";
  const items: { label: string; page?: NavPage; icon: typeof LayoutDashboard; visible: boolean }[] = [
    { label: "Dashboard", page: "dashboard", icon: LayoutDashboard, visible: true },
    { label: "Analytics", page: "analytics", icon: BarChart3, visible: !isUploader },
    { label: "Invoice History", page: "history", icon: FileText, visible: true },
    { label: "Audit Trail", page: "audit", icon: ClipboardList, visible: !isUploader },
    { label: "Profile", page: "profile", icon: UserRound, visible: true },
    { label: "User Management", icon: Users, visible: isAdmin },
  ];

  function navigate(page?: NavPage) {
    if (!page) return;
    onNavigate(page);
    onClose();
  }

  return (
    <>
      {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-slate-950 p-5 text-slate-300 shadow-2xl transition-transform lg:static lg:w-64 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between text-xl font-bold text-white"><span className="flex items-center gap-2"><ShieldCheck className="text-blue-400" /> Ledger AI</span><button aria-label="Close navigation" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10 lg:hidden"><X size={18} /></button></div>
        <nav className="space-y-2">{items.filter((item) => item.visible).map(({ label, page, icon: Icon }) => {
          const active = page === activePage;
          return <button key={label} disabled={!page} title={page ? undefined : "User management is not available in this workspace yet."} onClick={() => navigate(page)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active ? "bg-blue-500/20 text-white" : "hover:bg-white/10 hover:text-white"} disabled:cursor-not-allowed disabled:opacity-50`}><Icon size={18} />{label}</button>;
        })}</nav>
      </aside>
    </>
  );
}
