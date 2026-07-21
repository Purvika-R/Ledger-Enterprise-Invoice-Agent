type FieldValidationResult = {
  valid: boolean;
  message: string;
};

type Props = {
  fieldValidation: Record<string, FieldValidationResult> | null;
  approved: boolean;
  onApprove: () => void;
};

export default function ApprovalPanel({
  fieldValidation,
  approved,
  onApprove,
}: Props) {
  if (!fieldValidation) return null;

  const outstanding = Object.values(fieldValidation).filter(
    (result) => !result.valid
  );
  const allValid = outstanding.length === 0;

  if (approved) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="rounded-lg bg-green-100 p-4 text-green-700">
          ✅ Invoice approved
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">
        Human Review
      </h2>

      {allValid ? (
        <p className="mb-4 text-sm text-slate-600">
          All fields have passed validation. This invoice is ready for approval.
        </p>
      ) : (
        <p className="mb-4 text-sm text-slate-600">
          {outstanding.length} field{outstanding.length > 1 ? "s" : ""} still
          need{outstanding.length > 1 ? "" : "s"} correction before this
          invoice can be approved.
        </p>
      )}

      <button
        onClick={onApprove}
        disabled={!allValid}
        className={
          "w-full rounded-lg px-4 py-3 font-medium transition " +
          (allValid
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "cursor-not-allowed bg-slate-200 text-slate-400")
        }
      >
        Approve Invoice
      </button>
    </div>
  );
}