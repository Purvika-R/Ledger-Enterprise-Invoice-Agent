import { useEffect, useState } from "react";

import Header from "../components/layout/Header";
import UploadCard from "../components/upload/UploadCard";
import StatusCard from "../components/dashboard/StatusCard";

export default function Dashboard() {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      "http://127.0.0.1:8000/progress"
    );

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);

      setProgress((prev) => [...prev, update]);
    };

    eventSource.onerror = () => {
      console.log("SSE disconnected");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="mx-auto max-w-7xl p-8">

        <div className="grid gap-8 lg:grid-cols-2">

          <UploadCard
            onProcessed={setInvoiceData}
            setProcessing={setProcessing}
            clearProgress={() => setProgress([])}
          />

          <StatusCard
            data={invoiceData}
            processing={processing}
            progress={progress}
          />

        </div>

      </main>
    </div>
  );
}