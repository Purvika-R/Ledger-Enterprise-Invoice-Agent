import HeaderCard from "./HeaderCard";
import LineItemsTable from "./LineItemsTable";
import VendorMemoryCard from "./VendorMemoryCard";
import ConfidenceCard from "./ConfidenceCard";
import ValidationCard from "./ValidationCard";

type Props = {
  data: any;
  processing: boolean;
  progress: any[];
};

const AGENTS = [
  "OCR Agent",
  "Header Agent",
  "Line Item Agent",
  "Vendor Memory",
  "Confidence Agent",
  "Validation Agent",
];

export default function StatusCard({
  data,
  processing,
  progress,
}: Props) {

  if (processing) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">

        <h2 className="mb-6 text-2xl font-semibold">
          AI Processing Pipeline
        </h2>

        {AGENTS.map((agent) => {

          const event = progress.find(
            (p) => p.agent === agent
          );

          let icon = "⬜";

          if (event?.status === "running")
            icon = "🟡";

          if (event?.status === "completed")
            icon = "✅";

          return (
            <div
              key={agent}
              className="mb-4 flex items-center gap-3"
            >
              <span className="text-2xl">
                {icon}
              </span>

              <span>{agent}</span>
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

  return (
    <div className="space-y-6">

      <HeaderCard header={data.header} />

      <VendorMemoryCard
        vendorMemory={data.vendor_memory}
      />

      <ConfidenceCard
        confidence={data.confidence}
      />

      <ValidationCard
        confidence={data.confidence}
      />

      <LineItemsTable
        items={data.line_items}
      />

    </div>
  );
}