type Props = {
  confidence: any;
};

export default function ValidationCard({ confidence }: Props) {
  const passed =
    confidence &&
    Object.values(confidence).every(
      (score: any) => score >= 0.8
    );

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
          ⚠ Some fields require review
        </div>
      )}
    </div>
  );
}