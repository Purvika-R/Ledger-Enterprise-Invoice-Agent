import { useEffect, useState } from "react";

type AuditEntry = {
  agent_name: string;
  start_time: string;
  end_time: string | null;
  execution_time_ms: number | null;
  status: "running" | "completed" | "failed" | "pending";
  summary: string;
};

type Detail = {
  label: string;
  value: string;
};

type Props = {
  auditTrail: AuditEntry[];
  result: any;
};

const AGENT_DETAILS: Record<string, { icon: string; label: string }> = {
  "OCR Agent": { icon: "📄", label: "OCR Agent" },
  "Classification Agent": { icon: "🧠", label: "Classification Agent" },
  "Header Agent": { icon: "📑", label: "Header Agent" },
  "Line Item Agent": { icon: "📋", label: "Line Item Agent" },
  "Vendor Memory Agent": { icon: "🏢", label: "Vendor Memory Agent" },
  "Confidence Agent": { icon: "🎯", label: "Confidence Agent" },
  "Validation Agent": { icon: "✅", label: "Validation Agent" },
  "Retry Agent": { icon: "↻", label: "Retry Agent" },
  "Header Retry": { icon: "↻", label: "Header Retry" },
  "Line Item Retry": { icon: "↻", label: "Line Item Retry" },
};

const STATUS_CLASSES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  running: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-slate-100 text-slate-600",
};

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null) return "In progress";

  if (milliseconds < 1000) return `${milliseconds} ms`;

  const seconds = milliseconds / 1000;
  const precision = seconds >= 10 ? 1 : 2;

  return `${seconds.toFixed(precision)} sec`;
}

function formatFieldName(field: string) {
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function classificationDetails(entry: AuditEntry, result: any): Detail[] {
  const classification = result?.classification;

  if (classification) {
    const details = [
      { label: "Detected", value: classification.detected_document_type || "Unknown" },
      { label: "Confidence", value: `${Math.round((classification.confidence ?? 0) * 100)}%` },
      { label: "Method", value: classification.method || "Unknown" },
    ];

    if (classification.reason) {
      details.splice(1, 0, { label: "Reason", value: classification.reason });
    }

    return details;
  }

  const match = entry.summary.match(
    /^Detected (.+)\. Confidence (\d+)%\. Method: (.+)\.$/
  );

  if (match) {
    return [
      { label: "Detected", value: match[1] },
      { label: "Confidence", value: `${match[2]}%` },
      { label: "Method", value: match[3] },
    ];
  }

  return [{ label: "Summary", value: entry.summary }];
}

function agentDetails(entry: AuditEntry, result: any): Detail[] {
  if (entry.agent_name === "Classification Agent") {
    return classificationDetails(entry, result);
  }

  if (entry.agent_name === "Header Agent" || entry.agent_name === "Header Retry") {
    const fields = Object.keys(result?.header ?? {});

    return [
      { label: "Summary", value: entry.summary },
      ...(fields.length
        ? [{ label: "Header Fields", value: fields.map(formatFieldName).join("\n") }]
        : []),
    ];
  }

  if (entry.agent_name === "Vendor Memory Agent") {
    const vendorMemory = result?.vendor_memory;

    return [
      { label: "Vendor", value: vendorMemory?.known_vendor ? "Known Vendor" : "New Vendor" },
      { label: "Previous Invoices", value: String(vendorMemory?.history?.invoice_count ?? 0) },
      { label: "Summary", value: entry.summary },
    ];
  }

  if (entry.agent_name === "Confidence Agent") {
    const confidence = Object.values(result?.confidence ?? {}) as number[];
    const average = confidence.length
      ? Math.round((confidence.reduce((sum, value) => sum + value, 0) / confidence.length) * 100)
      : null;

    return [
      { label: "Average Confidence", value: average === null ? entry.summary : `${average}%` },
      { label: "Summary", value: entry.summary },
    ];
  }

  if (entry.agent_name === "Validation Agent") {
    const issueCount = result?.validation_errors?.length;

    return [
      {
        label: "Summary",
        value: issueCount === 0
          ? "No validation issues."
          : `${issueCount ?? 0} validation issue${issueCount === 1 ? "" : "s"} found.`,
      },
    ];
  }

  if (entry.agent_name === "Retry Agent" || entry.agent_name === "Line Item Retry") {
    return [{ label: "Summary", value: entry.summary }];
  }

  return [{ label: "Summary", value: entry.summary }];
}

export default function AuditTrailCard({ auditTrail, result }: Props) {
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const latestCompleted = auditTrail.reduce(
      (latest, entry, index) => entry.status === "completed" ? index : latest,
      -1
    );

    setExpandedIndexes(
      latestCompleted === -1 ? new Set() : new Set([latestCompleted])
    );
  }, [auditTrail]);

  if (!auditTrail?.length) return null;

  function toggleEntry(index: number) {
    setExpandedIndexes((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-semibold">
        Audit Trail
      </h2>

      <div className="space-y-3">
        {auditTrail.map((entry, index) => {
          const expanded = expandedIndexes.has(index);
          const agent = AGENT_DETAILS[entry.agent_name] ?? {
            icon: "•",
            label: entry.agent_name,
          };
          const details = agentDetails(entry, result);

          return (
            <div key={`${entry.agent_name}-${entry.start_time}`}>
              <div
                className={
                  "overflow-hidden rounded-lg border border-slate-200 " +
                  (entry.status === "completed" ? "audit-entry-complete" : "")
                }
              >
                <button
                  type="button"
                  onClick={() => toggleEntry(index)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.icon}</span>
                    <span className="font-medium">
                      {expanded ? "▼" : "▶"} {agent.label}
                    </span>
                  </div>

                  <span
                    className={
                      "rounded-full px-3 py-1 text-xs font-medium capitalize " +
                      (STATUS_CLASSES[entry.status] ?? STATUS_CLASSES.pending)
                    }
                  >
                    {entry.status}
                  </span>
                </button>

                {expanded && (
                  <div className="space-y-3 border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="font-medium capitalize text-slate-800">
                          {entry.status}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Execution Time</p>
                        <p className="font-medium text-slate-800">
                          {formatDuration(entry.execution_time_ms)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-500">Timestamp</p>
                      <p className="font-medium text-slate-800">
                        {new Date(entry.start_time).toLocaleString()}
                      </p>
                    </div>

                    {details.map((detail) => (
                      <div key={detail.label}>
                        <p className="text-slate-500">{detail.label}</p>
                        <p className="whitespace-pre-line font-medium text-slate-800">
                          {detail.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {index < auditTrail.length - 1 && (
                <div className="py-1 text-center text-slate-400">↓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
