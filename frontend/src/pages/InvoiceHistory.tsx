import { useEffect, useState } from "react";

import Header from "../components/layout/Header";
import { downloadInvoiceExport, getInvoices } from "../services/api";
import type { InvoiceSummary } from "../services/api";

type Props = { onNavigate: (page: "dashboard" | "analytics" | "history") => void; onOpenInvoice: (id: number) => void };

export default function InvoiceHistory({ onNavigate, onOpenInvoice }: Props) {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [vendor, setVendor] = useState("");
  const [currency, setCurrency] = useState("");
  const [validation, setValidation] = useState("");
  const load = () => getInvoices({ vendor: vendor || undefined, currency: currency || undefined, validation_passed: validation === "" ? undefined : validation === "passed" }).then(setInvoices).catch(console.error);

  useEffect(() => { load(); }, []);

  return <div className="min-h-screen bg-slate-100"><Header activePage="history" onNavigate={onNavigate} /><main className="mx-auto max-w-7xl p-8"><div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold">Invoice History</h2><div className="flex gap-2"><button onClick={() => downloadInvoiceExport("csv")} className="rounded bg-slate-700 px-4 py-2 text-sm text-white">Export CSV</button><button onClick={() => downloadInvoiceExport("json")} className="rounded bg-slate-700 px-4 py-2 text-sm text-white">Export JSON</button></div></div><div className="mb-6 flex gap-3 rounded-xl bg-white p-4 shadow"><input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Filter vendor" className="rounded border px-3 py-2" /><input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" className="w-28 rounded border px-3 py-2" /><select value={validation} onChange={(e) => setValidation(e.target.value)} className="rounded border px-3 py-2"><option value="">All validation</option><option value="passed">Passed</option><option value="failed">Failed</option></select><button onClick={load} className="rounded bg-blue-600 px-4 py-2 text-white">Apply</button></div><div className="overflow-x-auto rounded-xl bg-white shadow"><table className="min-w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-4 text-left">Invoice</th><th className="p-4 text-left">Vendor</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Total</th><th className="p-4 text-left">Validation</th><th className="p-4 text-left">Retry Used</th><th className="p-4 text-left">Approval</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} onClick={() => onOpenInvoice(invoice.id)} className="cursor-pointer border-t hover:bg-slate-50"><td className="p-4">{invoice.invoice_number || (invoice.is_invoice ? "-" : "Non-invoice")}</td><td className="p-4">{invoice.vendor || "-"}</td><td className="p-4">{invoice.invoice_date || "-"}</td><td className="p-4">{invoice.total_amount ?? "-"} {invoice.currency || ""}</td><td className="p-4">{invoice.validation_passed === null ? "N/A" : invoice.validation_passed ? "Passed" : "Failed"}</td><td className="p-4">{invoice.retry_used ? <span className="inline-flex items-center gap-2"><span className="font-semibold text-blue-700">YES</span>{invoice.auto_corrected && <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Auto Corrected</span>}</span> : <span className="font-semibold text-slate-500">NO</span>}</td><td className="p-4 capitalize">{invoice.approval_status}</td></tr>)}{!invoices.length && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No invoices found.</td></tr>}</tbody></table></div></main></div>;
}
