interface AIExplanationProps {
  explanation?: string;
}

export default function AIExplanation({
  explanation = "The AI verification system analyzes your uploaded documents for completeness, quality, and potential issues.",
}: AIExplanationProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          🤖
        </div>

        <div>
          <h2 className="text-lg font-semibold">AI Explanation</h2>
          <p className="text-sm text-gray-500">
            Verification insights
          </p>
        </div>
      </div>

      <p className="text-sm leading-6 text-gray-600">
        {explanation}
      </p>
    </div>
  );
}