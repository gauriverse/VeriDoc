interface ReadinessScoreProps {
  score?: number;
  verified?: number;
  warnings?: number;
  missing?: number;
}

export default function ReadinessScore({
  score = 0,
  verified = 0,
  warnings = 0,
  missing = 0,
}: ReadinessScoreProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Document Readiness</h2>
          <p className="text-xs text-gray-400">Automated Preliminary Verification</p>
        </div>
        <span className="text-3xl font-extrabold text-teal-700">{score}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            score >= 80 ? "bg-teal-600" : score >= 50 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-teal-700">
          <span className="h-2 w-2 rounded-full bg-teal-600"></span>
          {verified} verified
        </span>
        <span className="flex items-center gap-1.5 text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          {warnings} warnings
        </span>
        <span className="flex items-center gap-1.5 text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          {missing} missing / invalid
        </span>
      </div>
    </div>
  );
}