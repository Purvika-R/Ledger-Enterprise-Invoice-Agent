import HeaderCard from "./HeaderCard";
import LineItemsTable from "./LineItemsTable";
import VendorMemoryCard from "./VendorMemoryCard";
import ConfidenceCard from "./ConfidenceCard";
import ValidationCard from "./ValidationCard";
import ApprovalPanel from "./ApprovalPanel";
import NotInvoiceCard from "./NotInvoiceCard";

type FieldValidationResult = {
  valid: boolean;
  message: string;
};

type Props = {
  data: any;
  processing: boolean;
  progress: any[];
  reviewedHeader: any;
  reviewedLineItems: any[];
  liveFieldValidation: Record<string, FieldValidationResult> | null;
  approved: boolean;
  onHeaderFieldChange: (field: string, value: string) => void;
  onLineItemChange: (index: number, field: string, value: string) => void;
  onApprove: () => void;
  onUploadAnother?: () => void;
};

const AGENTS = [
  "OCR Agent",
  "Classification Agent",
  "Header Agent",
  "Line Item Agent",
  "Vendor Memory Agent",
  "Confidence Agent",
  "Validation Agent",
];

export default function StatusCard({
  data,
  processing,
  progress,
  reviewedHeader,
  reviewedLineItems,
  liveFieldValidation,
  approved,
  onHeaderFieldChange,
  onLineItemChange,
  onApprove,
  onUploadAnother,
}: Props) {

  if (processing) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">

        <h2 className="mb-6 text-2xl font-semibold">
          AI Processing Pipeline
        </h2>

        {AGENTS.map((agent) => {

          const event = [...progress].reverse().find(
            (p) => p.agent === agent
          );

          // pending (⬜) is the default when no event has arrived yet for
          // this agent -- this also covers agents the pipeline never
          // reached, e.g. everything after Classification on a rejected
          // document.
          let icon = "⬜";
          let labelClasses = "";

          if (event?.status === "running") {
            icon = "🟡";
          }

          if (event?.status === "completed") {
            icon = "✅";
          }

          if (event?.status === "failed") {
            icon = "❌";
            labelClasses = "font-medium text-red-600";
          }

          return (
            <div
              key={agent}
              className="mb-4 flex items-center gap-3"
            >
              <span className="text-2xl">
                {icon}
              </span>

              <span className={labelClasses}>{agent}</span>
            </div>
          );
        })}

      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Waiting for invoice...
      </div>
    );
  }

  if (data.success === false) {
    return (
      <NotInvoiceCard
        classification={data.classification}
        onUploadAnother={onUploadAnother}
      />
    );
  }

  return (
    <div className="space-y-6">

      <HeaderCard
        header={reviewedHeader ?? data.header}
        fieldValidation={data.field_validation}
        liveFieldValidation={liveFieldValidation ?? undefined}
        onFieldChange={onHeaderFieldChange}
        locked={approved}
      />

      <VendorMemoryCard
        vendorMemory={data.vendor_memory}
      />

      <ConfidenceCard
        confidence={data.confidence}
      />

      <ValidationCard
        validationErrors={data.validation_errors}
        fieldValidation={data.field_validation}
      />

      <LineItemsTable
        items={reviewedLineItems ?? data.line_items}
        fieldValidation={data.field_validation}
        liveFieldValidation={liveFieldValidation ?? undefined}
        onItemChange={onLineItemChange}
        locked={approved}
      />

      <ApprovalPanel
        fieldValidation={liveFieldValidation}
        approved={approved}
        onApprove={onApprove}
      />

    </div>
  );
}
