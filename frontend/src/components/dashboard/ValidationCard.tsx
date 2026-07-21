type FieldValidation = {
  valid: boolean;
  message: string;
};

type Props = {
  validationErrors: string[];
  fieldValidation?: Record<string, FieldValidation>;
};

export default function ValidationCard({
  validationErrors,
  fieldValidation,
}: Props) {
  const errors = validationErrors ?? [];
  const passed = errors.length === 0;

  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <h2 className="mb-4 text-xl font-semibold">
        Validation
      </h2>

      {passed ? (
        <div className="rounded-lg bg-green-100 p-4 text-green-700">
          ✅ Validation Passed
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-100 p-4 text-yellow-700">
          <p className="mb-2 font-medium">
            ⚠ {errors.length} issue{errors.length > 1 ? "s" : ""} require review
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {fieldValidation && (
        <div className="mt-4 space-y-1 text-sm">
          {Object.entries(fieldValidation).map(([field, result]) => (
            <div
              key={field}
              className="flex items-center justify-between border-b border-slate-100 py-1"
            >
              <span className="capitalize text-slate-600">
                {field.replace(/_/g, " ")}
              </span>
              <span
                className={
                  result.valid ? "text-green-600" : "text-red-600"
                }
                title={result.message}
              >
                {result.valid ? "✓ valid" : "✗ " + result.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}