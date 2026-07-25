import axios from "axios";

const api = axios.create({
  baseURL: "https://ledger-enterprise-invoice-agent-1.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledger_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

export type InvoiceSummary = {
  id: number;
  invoice_number: string | null;
  vendor: string | null;
  invoice_date: string | null;
  currency: string | null;
  total_amount: number | null;
  approval_status: string;
  validation_passed: boolean | null;
  is_invoice: boolean;
  retry_used: boolean;
  retry_count: number;
  auto_corrected: boolean;
};

export async function getInvoices(filters: Record<string, string | boolean | undefined> = {}) {
  const response = await api.get<InvoiceSummary[]>("/invoices", { params: filters });
  return response.data;
}

export async function getInvoice(invoiceId: number) {
  const response = await api.get(`/invoices/${invoiceId}`);
  return response.data;
}

export async function getAnalytics() {
  const response = await api.get("/analytics");
  return response.data;
}

export async function downloadInvoiceExport(format: "csv" | "json") {
  const response = await api.get(`/invoices/export?format=${format}`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoices.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function processInvoice(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/process-invoice",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function deleteInvoice(invoiceId: number) {
  await api.delete(`/invoices/${invoiceId}`);
}