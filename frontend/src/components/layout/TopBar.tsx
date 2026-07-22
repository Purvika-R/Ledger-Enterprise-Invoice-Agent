import { Bell, LogOut, Menu } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function TopBar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();

  return <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6"><div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={onMenu} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu size={20} /></button><div><p className="font-semibold text-slate-900">Ledger workspace</p><p className="hidden text-sm text-slate-500 sm:block">Enterprise invoice intelligence</p></div></div><div className="flex items-center gap-3 sm:gap-4"><Bell size={19} className="hidden text-slate-500 sm:block"/><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">{user?.role}</span><div className="hidden text-right text-sm md:block"><p className="font-medium">{user?.name}</p><p className="text-slate-500">{user?.email}</p></div><button aria-label="Log out" onClick={logout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><LogOut size={18}/></button></div></header>;
}
