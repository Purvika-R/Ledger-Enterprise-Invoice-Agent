type Props = {
  confidence: any;
};

export default function ConfidenceCard({ confidence }: Props) {
  if (!confidence) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <h2 className="mb-5 text-xl font-semibold">
        Confidence Scores
      </h2>

      {Object.entries(confidence).map(([key, value]: any) => (

        <div key={key} className="mb-5">

          <div className="mb-2 flex justify-between">

            <span className="capitalize">
              {key.replace("_", " ")}
            </span>

            <span>
              {(value * 100).toFixed(0)}%
            </span>

          </div>

          <div className="h-3 rounded bg-slate-200">

            <div
              className="h-3 rounded bg-blue-600"
              style={{
                width: `${value * 100}%`,
              }}
            />

          </div>

        </div>

      ))}
    </div>
  );
}