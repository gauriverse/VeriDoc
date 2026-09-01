interface AIExplanationProps {
  explanation?: string;
  score?: number;
  issues?: string[];
}

export default function AIExplanation({
  explanation,
  score,
  issues = [],
}: AIExplanationProps) {
  const defaultExplanation =
    explanation ||
    (score !== undefined
      ? `The automated verification completed with a score of ${score}/100 based on preliminary text extraction and field format checks.`
      : "The automated verification system analyzes your uploaded documents for completeness, quality, and potential issues.");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold">
          ℹ️
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Verification Summary</h2>
          <p className="text-xs text-gray-400">Automated preliminary insights</p>
        </div>
      </div>

      <p className="text-sm leading-6 text-gray-600">
        {defaultExplanation}
      </p>

      {issues.length > 0 && (
        <div className="mt-4 rounded-xl bg-amber-50/50 p-4 border border-amber-100">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
            Identified items ({issues.length})
          </p>
          <ul className="space-y-1 text-xs text-amber-900 list-disc list-inside">
            {issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}