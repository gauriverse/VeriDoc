import {
    AlertTriangle,
    XCircle,
    ArrowRight,
  } from "lucide-react";
  
  interface IssueCardProps {
    severity: "warning" | "error";
    title: string;
    description: string;
    recommendation: string;
  }
  
  export default function IssueCard({
    severity,
    title,
    description,
    recommendation,
  }: IssueCardProps) {
    const isWarning = severity === "warning";
  
    return (
      <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isWarning ? "bg-amber-50" : "bg-red-50"
          }`}
        >
          {isWarning ? (
            <AlertTriangle
              size={20}
              className="text-amber-600"
            />
          ) : (
            <XCircle
              size={20}
              className="text-red-600"
            />
          )}
        </div>
  
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900">
              {title}
            </h3>
  
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isWarning
                  ? "text-amber-700"
                  : "text-red-700"
              }`}
            >
              {isWarning ? "Warning" : "Action required"}
            </span>
          </div>
  
          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>
  
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
            <ArrowRight
              size={15}
              className="mt-0.5 shrink-0 text-gray-400"
            />
  
            <p className="text-xs font-medium leading-5 text-gray-600">
              {recommendation}
            </p>
          </div>
        </div>
      </div>
    );
  }