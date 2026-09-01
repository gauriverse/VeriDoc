import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    FileText,
    ArrowUpRight,
  } from "lucide-react";
  
  interface DocumentCardProps {
    filename: string;
    type: string;
    status: "verified" | "warning" | "missing";
    confidence?: number;
    message?: string;
    onViewDetails: () => void;
  }
  
  export default function DocumentCard({
    filename,
    type,
    status,
    confidence,
    message,
    onViewDetails,
  }: DocumentCardProps) {
    const statusConfig = {
      verified: {
        label: "Verified",
        icon: CheckCircle2,
        iconClass: "text-teal-700",
        bgClass: "bg-teal-50",
        badgeClass: "bg-teal-50 text-teal-700",
      },
  
      warning: {
        label: "Needs attention",
        icon: AlertTriangle,
        iconClass: "text-amber-600",
        bgClass: "bg-amber-50",
        badgeClass: "bg-amber-50 text-amber-700",
      },
  
      missing: {
        label: "Missing",
        icon: XCircle,
        iconClass: "text-red-600",
        bgClass: "bg-red-50",
        badgeClass: "bg-red-50 text-red-700",
      },
    };
  
    const config = statusConfig[status];
    const StatusIcon = config.icon;
  
    return (
      <div className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.bgClass}`}
            >
              <FileText
                size={21}
                className={config.iconClass}
              />
            </div>
  
            <div>
              <h3 className="font-semibold text-gray-900">
                {type}
              </h3>
  
              <p className="mt-0.5 max-w-[170px] truncate text-xs text-gray-400">
                {filename}
              </p>
            </div>
          </div>
  
          <StatusIcon
            size={21}
            className={config.iconClass}
          />
        </div>
  
        {/* Status */}
        <div className="mt-5 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}
          >
            {config.label}
          </span>
  
          {confidence !== undefined && (
            <span className="text-xs font-semibold text-gray-500">
              {Math.round(confidence * 100)}% confidence
            </span>
          )}
        </div>
  
        {/* Confidence Bar */}
        {confidence !== undefined && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-700"
              style={{
                width: `${confidence * 100}%`,
              }}
            />
          </div>
        )}
  
        {/* Message */}
        {message && (
          <div className="mt-4 rounded-xl bg-gray-50 p-3">
            <p className="text-xs leading-5 text-gray-600">
              {message}
            </p>
          </div>
        )}
  
        {/* Details */}
        <button
          onClick={onViewDetails}
          className="mt-5 flex w-full items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-gray-700 transition hover:text-teal-700"
        >
          View details
  
          <ArrowUpRight
            size={17}
            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    );
  }