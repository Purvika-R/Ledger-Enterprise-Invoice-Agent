type FieldValidationResult = {
  valid: boolean;
  message: string;
};

type Props = {
  items: any[];
  fieldValidation?: Record<string, FieldValidationResult>;
  liveFieldValidation?: Record<string, FieldValidationResult>;
  onItemChange?: (index: number, field: string, value: string) => void;
  locked?: boolean;
};

export default function LineItemsTable({
  items,
  fieldValidation,
  liveFieldValidation,
  onItemChange,
  locked,
}: Props) {
  const originalIssue = fieldValidation?.line_items;
  const liveIssue = liveFieldValidation?.line_items;

  // The line item check is an aggregate (sum vs. header total), so the
  // whole Amount column opens up for editing when it fails — not a single
  // row — since any row could be the source of the mismatch.
  const editable = Boolean(originalIssue && !originalIssue.valid) && !locked;

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-semibold">
        Invoice Line Items
      </h2>

      {originalIssue && !originalIssue.valid && (
        <div
          className={
            "mb-4 rounded-lg border p-3 text-sm " +
            (liveIssue?.valid
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-red-300 bg-red-50 text-red-700")
          }
          title={(liveIssue ?? originalIssue).message}
        >
          {liveIssue?.valid ? "✓ " : "⚠ "}
          {(liveIssue ?? originalIssue).message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">

          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Unit Price</th>
              <th
                className={
                  "p-3 text-right" + (editable ? " bg-red-100" : "")
                }
              >
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-3">
                  {item.description}
                </td>

                <td className="p-3 text-center">
                  {item.quantity}
                </td>

                <td className="p-3 text-right">
                  {item.unit_price}
                </td>

                <td
                  className={
                    "p-3 text-right font-medium" +
                    (editable ? " bg-red-50" : "")
                  }
                >
                  {editable ? (
                    <input
                      type="number"
                      value={item.amount ?? ""}
                      onChange={(e) =>
                        onItemChange?.(index, "amount", e.target.value)
                      }
                      className={
                        "w-28 rounded border px-2 py-1 text-right focus:outline-none focus:ring-2 " +
                        (liveIssue?.valid
                          ? "border-green-400 focus:ring-green-300"
                          : "border-red-400 focus:ring-red-300")
                      }
                    />
                  ) : (
                    item.amount
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}