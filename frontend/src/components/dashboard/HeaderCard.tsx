type FieldValidationResult = {
  valid: boolean;
  message: string;
};

type Props = {
  header: any;
  fieldValidation?: Record<string, FieldValidationResult>;
  liveFieldValidation?: Record<string, FieldValidationResult>;
  onFieldChange?: (field: string, value: string) => void;
  locked?: boolean;
};

const HEADER_FIELDS: { key: string; label: string; emphasize?: boolean }[] = [
  { key: "invoice_number", label: "Invoice Number" },
  { key: "vendor", label: "Vendor" },
  { key: "invoice_date", label: "Invoice Date" },
  { key: "currency", label: "Currency" },
  { key: "total_amount", label: "Total Amount", emphasize: true },
];

export default function HeaderCard({
  header,
  fieldValidation,
  liveFieldValidation,
  onFieldChange,
  locked,
}: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-semibold">
        Invoice Header
      </h2>

      <div className="space-y-4">

        {HEADER_FIELDS.map(({ key, label, emphasize }) => {
          // A field is only opened up for editing if the AI pipeline
          // originally flagged it invalid. Fields the pipeline trusted
          // stay read-only, per the review workflow.
          const original = fieldValidation?.[key];
          const live = liveFieldValidation?.[key];
          const editable = Boolean(original && !original.valid) && !locked;

          const wrapperClasses =
            original && !original.valid
              ? "rounded-lg border border-red-300 bg-red-50 px-3 py-2"
              : "";

          return (
            <div key={key} className={wrapperClasses}>

              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {label}
                </p>

                {editable && live && (
                  <span
                    className={
                      "text-xs font-medium " +
                      (live.valid ? "text-green-600" : "text-red-600")
                    }
                    title={live.message}
                  >
                    {live.valid ? "✓ corrected" : "✗ needs fix"}
                  </span>
                )}
              </div>

              {editable ? (
                <input
                  type="text"
                  value={header?.[key] ?? ""}
                  onChange={(e) => onFieldChange?.(key, e.target.value)}
                  title={original?.message}
                  className={
                    "w-full rounded border px-2 py-1 font-medium focus:outline-none focus:ring-2 " +
                    (live?.valid
                      ? "border-green-400 focus:ring-green-300"
                      : "border-red-400 focus:ring-red-300")
                  }
                />
              ) : (
                <p
                  className={
                    emphasize
                      ? "text-lg font-semibold text-blue-600"
                      : "font-medium"
                  }
                >
                  {header?.[key] || "-"}
                </p>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}