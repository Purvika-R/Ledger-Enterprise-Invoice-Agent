import { Bell, LogOut, Menu, Moon, Sparkles } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import type { AppPage } from "./ProtectedLayout";

const titles: Record<AppPage, { title: string; subtitle: string }> = {
  dashboard: { title: "Workspace", subtitle: "Invoice intelligence at a glance" },
  analytics: { title: "Analytics", subtitle: "Operational performance and trends" },
  history: { title: "Invoice history", subtitle: "Your processed invoice records" },
  profile: { title: "Profile", subtitle: "Account and workspace details" },
};

export default function TopBar({ activePage, onMenu }: { activePage: AppPage; onMenu: () => void }) {
  const { user, logout } = useAuth();
  const page = titles[activePage];
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "LA";

  return <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl"><div className="flex h-18 items-center justify-between px-4 py-3 sm:px-7"><div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={onMenu} className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden"><Menu size={20} /></button><div><div className="flex items-center gap-2"><h1 className="font-semibold tracking-tight text-slate-950">{page.title}</h1><span className="hidden rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 sm:inline-flex">Ledger AI</span></div><p className="hidden text-xs text-slate-500 sm:block">{page.subtitle}</p></div></div><div className="flex items-center gap-1.5 sm:gap-3"><button aria-label="Toggle theme" title="Theme settings coming soon" className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 sm:block"><Moon size={18} /></button><button aria-label="Notifications" title="Notifications coming soon" className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"><Bell size={18} /></button><div className="hidden h-7 w-px bg-slate-200 sm:block" /><div className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 sm:pr-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm"><Sparkles size={14} /></div><div className="hidden text-left sm:block"><p className="max-w-30 truncate text-xs font-semibold text-slate-800">{user?.name}</p><p className="text-[11px] capitalize text-slate-500">{user?.role}</p></div><span className="sr-only">{initials}</span></div><button aria-label="Log out" onClick={logout} className="rounded-xl p-2.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><LogOut size={18} /></button></div></div></header>;
}
