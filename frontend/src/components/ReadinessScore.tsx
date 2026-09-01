interface ReadinessScoreProps {
  score?: number;
}

export default function ReadinessScore({
  score = 0,
}: ReadinessScoreProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Document Readiness</h2>
        <span className="text-2xl font-bold">{score}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Your document completeness score
      </p>
    </div>
  );
}