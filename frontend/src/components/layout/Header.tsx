type Page = "dashboard" | "analytics" | "history";

type Props = {
  activePage?: Page;
  onNavigate?: (page: Page) => void;
};

export default function Header({ activePage = "dashboard", onNavigate }: Props) {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ledger AI</h1>
          <p className="mt-1 text-sm text-slate-500">Enterprise Invoice Intelligence Agent</p>
        </div>
        <div className="flex items-center gap-4">
          {onNavigate && <nav className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">{(["dashboard", "analytics", "history"] as Page[]).map((page) => <button key={page} onClick={() => onNavigate(page)} className={"rounded-md px-3 py-2 font-medium " + (activePage === page ? "bg-white text-blue-700 shadow-sm" : "text-slate-600")}>{page === "dashboard" ? "Processing" : page === "analytics" ? "Analytics" : "Invoice History"}</button>)}</nav>}
          <div className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">Backend Connected ✅</div>
        </div>
      </div>
    </header>
  );
}
