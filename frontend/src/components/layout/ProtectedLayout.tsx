import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function ProtectedLayout({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-slate-100 lg:flex"><Sidebar/><div className="min-w-0 flex-1"><TopBar/>{children}</div></div>; }
