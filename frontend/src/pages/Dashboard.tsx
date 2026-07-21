import { useEffect, useMemo, useState } from "react";

import Header from "../components/layout/Header";
import UploadCard from "../components/upload/UploadCard";
import StatusCard from "../components/dashboard/StatusCard";
import AuditTrailCard from "../components/dashboard/AuditTrailCard";
import { validateHeaderAndLineItems } from "../utils/validation";

type Props = {
  onNavigate?: (page: "dashboard" | "analytics" | "history") => void;
};

export default function Dashboard({ onNavigate }: Props) {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);

  // Human Review state: editable copies of the header/line items, seeded
  // from the pipeline's output each time a new invoice comes in.
  const [reviewedHeader, setReviewedHeader] = useState<any>(null);
  const [reviewedLineItems, setReviewedLineItems] = useState<any[]>([]);
  const [approved, setApproved] = useState(false);

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

  useEffect(() => {
    if (!invoiceData) {
      setReviewedHeader(null);
      setReviewedLineItems([]);
      setApproved(false);
      return;
    }

    setReviewedHeader({ ...invoiceData.header });
    setReviewedLineItems(
      (invoiceData.line_items || []).map((item: any) => ({ ...item }))
    );
    setApproved(false);
  }, [invoiceData]);

  const liveFieldValidation = useMemo(() => {
    if (!reviewedHeader) return null;

    return validateHeaderAndLineItems(reviewedHeader, reviewedLineItems);
  }, [reviewedHeader, reviewedLineItems]);

  function handleHeaderFieldChange(field: string, value: string) {
    setReviewedHeader((prev: any) => ({ ...prev, [field]: value }));
  }

  function handleLineItemChange(
    index: number,
    field: string,
    value: string
  ) {
    setReviewedLineItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function handleApprove() {
    setApproved(true);
  }

  function handleUploadAnother() {
    setInvoiceData(null);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header activePage="dashboard" onNavigate={onNavigate} />

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
            reviewedHeader={reviewedHeader}
            reviewedLineItems={reviewedLineItems}
            liveFieldValidation={liveFieldValidation}
            approved={approved}
            onHeaderFieldChange={handleHeaderFieldChange}
            onLineItemChange={handleLineItemChange}
            onApprove={handleApprove}
            onUploadAnother={handleUploadAnother}
          />

          <AuditTrailCard
            auditTrail={invoiceData?.audit_trail ?? []}
            result={invoiceData}
          />

        </div>

      </main>
    </div>
  );
}
