import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    FileText,
  } from "lucide-react";
  
  import type { VerificationDocument } from "../data/mockVerification";

  interface DocumentDetailsModalProps {
    document: VerificationDocument | null;
    onClose: () => void;
  }
  
  export default function DocumentDetailsModal({
    document,
    onClose,
  }: DocumentDetailsModalProps) {
    if (!document) {
      return null;
    }
  
    const isVerified = document.status === "verified";
    const isWarning = document.status === "warning";
    const isMissing = document.status === "missing";
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-5 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isVerified
                      ? "bg-teal-50"
                      : isWarning
                      ? "bg-amber-50"
                      : "bg-red-50"
                  }`}
                >
                  <FileText
                    size={20}
                    className={
                      isVerified
                        ? "text-teal-700"
                        : isWarning
                        ? "text-amber-600"
                        : "text-red-600"
                    }
                  />
                </div>
  
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Document details
                  </p>
  
                  <h2 className="heading-font mt-1 text-xl font-bold text-gray-950">
                    {document.type}
                  </h2>
                </div>
              </div>
  
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
  
          {/* Content */}
          <div className="space-y-6 p-6">
            {/* File information */}
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Uploaded file
              </p>
  
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {document.filename}
              </p>
            </div>
  
            {/* Status */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-400">
                  Verification status
                </p>
  
                <div className="mt-2 flex items-center gap-2">
                  {isVerified && (
                    <CheckCircle2
                      size={18}
                      className="text-teal-700"
                    />
                  )}
  
                  {isWarning && (
                    <AlertTriangle
                      size={18}
                      className="text-amber-600"
                    />
                  )}
  
                  {isMissing && (
                    <XCircle
                      size={18}
                      className="text-red-600"
                    />
                  )}
  
                  <span
                    className={`text-sm font-bold ${
                      isVerified
                        ? "text-teal-700"
                        : isWarning
                        ? "text-amber-700"
                        : "text-red-700"
                    }`}
                  >
                    {isVerified
                      ? "Verified"
                      : isWarning
                      ? "Needs Attention"
                      : "Missing"}
                  </span>
                </div>
              </div>
  
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-400">
                  AI confidence
                </p>
  
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {document.confidence
                    ? `${Math.round(
                        document.confidence * 100
                      )}%`
                    : "Not available"}
                </p>
              </div>
            </div>
  
            {/* Warning message */}
            {document.message && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
  
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Attention required
                    </p>
  
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      {document.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
  
            {/* Extracted fields */}
            {document.fields &&
              document.fields.length > 0 && (
                <div>
                  <div className="mb-3">
                    <p className="text-sm font-bold text-gray-900">
                      Extracted information
                    </p>
  
                    <p className="mt-1 text-xs text-gray-400">
                      Information detected from the uploaded document
                    </p>
                  </div>
  
                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
                    {document.fields.map((field) => (
                      <div
                        key={field.label}
                        className="flex items-center justify-between gap-5 p-4"
                      >
                        <div>
                          <p className="text-xs text-gray-400">
                            {field.label}
                          </p>
  
                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {field.value}
                          </p>
                        </div>
  
                        {field.status === "valid" ? (
                          <CheckCircle2
                            size={18}
                            className="shrink-0 text-teal-700"
                          />
                        ) : (
                          <AlertTriangle
                            size={18}
                            className="shrink-0 text-amber-600"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
            {/* Missing state */}
            {isMissing && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <div className="flex gap-3">
                  <XCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
  
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Document not uploaded
                    </p>
  
                    <p className="mt-1 text-sm leading-6 text-red-800">
                      This document is required for the application
                      but was not detected in the uploaded files.
                    </p>
                  </div>
                </div>
              </div>
            )}
  
            {/* Validation checklist */}
            <div>
              <p className="mb-3 text-sm font-bold text-gray-900">
                Validation checks
              </p>
  
              <div className="space-y-3">
                <ValidationItem
                  label="Document type detected"
                  status={!isMissing}
                />
  
                <ValidationItem
                  label="Document is readable"
                  status={!isMissing}
                />
  
                <ValidationItem
                  label="Required information found"
                  status={!isMissing}
                />
  
                <ValidationItem
                  label="Information consistency"
                  status={isVerified}
                  warning={isWarning}
                />
              </div>
            </div>
  
            {/* Close */}
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-gray-950 py-3.5 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              Close details
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  function ValidationItem({
    label,
    status,
    warning = false,
  }: {
    label: string;
    status: boolean;
    warning?: boolean;
  }) {
    if (warning) {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle
              size={14}
              className="text-amber-600"
            />
          </div>
  
          <span className="text-sm text-gray-600">
            {label}
          </span>
  
          <span className="ml-auto text-xs font-semibold text-amber-700">
            Review
          </span>
        </div>
      );
    }
  
    return (
      <div className="flex items-center gap-3">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full ${
            status ? "bg-teal-50" : "bg-red-50"
          }`}
        >
          {status ? (
            <CheckCircle2
              size={14}
              className="text-teal-700"
            />
          ) : (
            <XCircle
              size={14}
              className="text-red-600"
            />
          )}
        </div>
  
        <span className="text-sm text-gray-600">
          {label}
        </span>
  
        <span
          className={`ml-auto text-xs font-semibold ${
            status ? "text-teal-700" : "text-red-700"
          }`}
        >
          {status ? "Passed" : "Not found"}
        </span>
      </div>
    );
  }