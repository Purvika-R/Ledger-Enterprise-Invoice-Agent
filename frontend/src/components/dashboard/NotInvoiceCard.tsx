type ClassificationResult = {
  is_invoice?: boolean;
  confidence?: number;
  reason?: string;
  detected_document_type?: string;
  method?: string;
  matched_keywords?: string[];
};

type Props = {
  classification: ClassificationResult | null | undefined;
  onUploadAnother?: () => void;
};

export default function NotInvoiceCard({
  classification,
  onUploadAnother,
}: Props) {
  // Requirement 4: classification failed unexpectedly / came back malformed.
  if (!classification || typeof classification.is_invoice === "undefined") {
    return (
      <div className="rounded-xl bg-white p-8 shadow">

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-lg font-semibold text-slate-700">
            Unable to determine document type.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            The classification result was missing or could not be read.
            Please try uploading the document again.
          </p>
        </div>

        {onUploadAnother && (
          <div className="mt-6 text-center">
            <button
              onClick={onUploadAnother}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Upload Another Document
            </button>
          </div>
        )}

      </div>
    );
  }

  const { confidence, reason, detected_document_type, matched_keywords } =
    classification;

  const confidencePct =
    typeof confidence === "number" ? Math.round(confidence * 100) : null;

  return (
    <div className="rounded-xl bg-white p-8 shadow">

      <div className="rounded-lg border border-red-200 bg-red-50 p-6">

        <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold text-red-700">
          <span>❌</span>
          <span>Document is not an Invoice</span>
        </h2>

        <div className="space-y-4">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-red-500">
              Detected document
            </p>
            <p className="text-lg text-slate-800">
              {detected_document_type || "Unknown"}
            </p>
          </div>

          {confidencePct !== null && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-red-500">
                Confidence
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-3 w-full max-w-xs rounded bg-red-100">
                  <div
                    className="h-3 rounded bg-red-500"
                    style={{ width: `${confidencePct}%` }}
                  />
                </div>
                <span className="text-sm text-slate-700">
                  {confidencePct}%
                </span>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-red-500">
              Reason
            </p>
            <p className="text-slate-800">
              {reason || "No reason provided."}
            </p>
          </div>

          {matched_keywords && matched_keywords.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-500">
                Matched Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {matched_keywords.map((keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      <p className="mt-6 text-center text-slate-600">
        This document does not appear to be an invoice.
        <br />
        Please upload a valid invoice to continue.
      </p>

      {onUploadAnother && (
        <div className="mt-6 text-center">
          <button
            onClick={onUploadAnother}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Upload Another Document
          </button>
        </div>
      )}

    </div>
  );
}