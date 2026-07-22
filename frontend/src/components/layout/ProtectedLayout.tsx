import { createContext, useState, type ReactNode } from "react";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export type AppPage = "dashboard" | "analytics" | "history" | "profile";

type Props = {
  activePage: AppPage;
  onNavigate: (page: AppPage | "audit") => void;
  children: ReactNode;
};

export const AppShellContext = createContext(false);

export default function ProtectedLayout({ activePage, onNavigate, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShellContext.Provider value>
      <div className="min-h-screen bg-slate-100 lg:flex">
        <Sidebar activePage={activePage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={onNavigate} />
        <div className="min-w-0 flex-1">
          <TopBar onMenu={() => setSidebarOpen(true)} />
          {children}
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
