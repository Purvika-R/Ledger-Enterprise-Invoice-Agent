import { useEffect, useState } from "react";

import Header from "../components/layout/Header";
import { getAnalytics } from "../services/api";

type Props = { onNavigate: (page: "dashboard" | "analytics" | "history") => void };

function Chart({ title, items, label }: { title: string; items: any[]; label: string }) {
  const maximum = Math.max(...items.map((item) => item.count), 1);
  return <section className="rounded-xl bg-white p-6 shadow"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{items.length === 0 ? <p className="text-sm text-slate-500">No data yet.</p> : <div className="space-y-4">{items.map((item) => <div key={item[label]}><div className="mb-1 flex justify-between text-sm"><span>{item[label]}</span><span>{item.count}</span></div><div className="h-3 rounded bg-slate-100"><div className="h-3 rounded bg-blue-600" style={{ width: `${item.count / maximum * 100}%` }} /></div></div>)}</div>}</section>;
}

export default function AnalyticsDashboard({ onNavigate }: Props) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { getAnalytics().then(setData).catch(console.error); }, []);
  const stats = [["Total Invoices", data?.total_invoices ?? 0], ["Known Vendors", data?.known_vendors ?? 0], ["Average Confidence", `${data?.average_confidence ?? 0}%`], ["Validation Success", `${data?.validation_success_rate ?? 0}%`], ["Invoices Automatically Corrected", data?.invoices_automatically_corrected ?? 0], ["Retry Success Rate", `${data?.retry_success_rate ?? 0}%`], ["Retry Failure Rate", `${data?.retry_failure_rate ?? 0}%`], ["Average Retry Time", `${data?.average_retry_time_ms ?? 0} ms`]];
  return <div className="min-h-screen bg-slate-100"><Header activePage="analytics" onNavigate={onNavigate} /><main className="mx-auto max-w-7xl p-8"><h2 className="mb-6 text-2xl font-semibold">Analytics Dashboard</h2><div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value]) => <div key={label} className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div><div className="grid gap-6 lg:grid-cols-2"><Chart title="Vendor Frequency" items={data?.vendor_frequency ?? []} label="vendor" /><Chart title="Invoice Trend" items={data?.invoice_trend ?? []} label="date" /><Chart title="Confidence Distribution" items={data?.confidence_distribution ?? []} label="range" /><Chart title="Validation Status" items={data?.validation_status ?? []} label="status" /></div></main></div>;
}
