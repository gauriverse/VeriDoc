import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import ReadinessScore from "../components/ReadinessScore";
import DocumentCard from "../components/DocumentCard";
import IssueCard from "../components/IssueCard";
import AIExplanation from "../components/AIExplanation";
import type { VerificationResultData } from "./Upload";

interface ResultsProps {
  onBackToUpload?: () => void;
  result?: VerificationResultData | null;
}

interface DisplayDocument {
  filename: string;
  type: string;
  status: "verified" | "warning" | "missing";
  confidence?: number;
  message?: string;
  fields?: Record<string, any>;
  checks?: Array<{ name: string; passed: boolean; message: string }>;
}

interface DisplayIssue {
  severity: "warning" | "error";
  title: string;
  description: string;
  recommendation: string;
}

export default function Results({
  onBackToUpload,
  result,
}: ResultsProps) {
  const [selectedDocument, setSelectedDocument] =
    useState<DisplayDocument | null>(null);

  // Parse result data into display structures
  let score = 0;
  let verifiedCount = 0;
  let warningCount = 0;
  let missingCount = 0;
  let displayDocs: DisplayDocument[] = [];
  let displayIssues: DisplayIssue[] = [];
  let explanationText = "";

  if (result) {
    if (result.type === "single") {
      const data = result.data;
      score = data.score;
      const statusMap = {
        VERIFIED: "verified" as const,
        REVIEW_REQUIRED: "warning" as const,
        INVALID: "missing" as const,
      };
      const docStatus = statusMap[data.status] || "warning";

      if (docStatus === "verified") verifiedCount = 1;
      else if (docStatus === "warning") warningCount = 1;
      else missingCount = 1;

      displayDocs = [
        {
          filename: result.file.name,
          type: data.document_type || "UNKNOWN",
          status: docStatus,
          confidence: data.confidence,
          message: data.warnings.length > 0 ? data.warnings.join("; ") : undefined,
          fields: data.fields,
          checks: data.checks,
        },
      ];

      displayIssues = data.warnings.map((warn) => ({
        severity: docStatus === "missing" ? "error" : "warning",
        title: `${data.document_type || "Document"} Verification Flag`,
        description: warn,
        recommendation: "Please check that document image is crisp, unblurred, and clear.",
      }));

      explanationText = `Single document verification completed with a preliminary score of ${score}/100. Document classified as ${data.document_type}.`;
    } else if (result.type === "application") {
      const data = result.data;
      score = data.readiness_score;
      verifiedCount = data.summary.verified;
      warningCount = data.summary.warnings;
      missingCount = data.summary.missing + data.summary.failed;

      displayDocs = data.documents.map((doc) => {
        const s = doc.status === "verified" ? "verified" : doc.status === "warning" ? "warning" : "missing";
        return {
          filename: doc.filename,
          type: doc.type,
          status: s,
          confidence: doc.confidence,
          message: doc.issues && doc.issues.length > 0 ? doc.issues[0]?.message : undefined,
          fields: doc.fields,
        };
      });

      displayIssues = data.issues.map((iss) => ({
        severity: iss.severity === "error" ? ("error" as const) : ("warning" as const),
        title: iss.type || "Validation Issue",
        description: iss.message,
        recommendation: iss.recommendation || "Review and re-upload document.",
      }));

      explanationText = `Application verification processed ${displayDocs.length} documents. Overall readiness score is ${score}/100.`;
    }
  } else {
    // Demo / fallback placeholder if navigated directly
    score = 85;
    verifiedCount = 1;
    warningCount = 0;
    missingCount = 0;
    displayDocs = [
      {
        filename: "SampleDoc.jpg",
        type: "PAN",
        status: "verified",
        confidence: 0.95,
        fields: { name: "SAMPLE NAME", pan_number: "ABCDE1234F" },
      },
    ];
    explanationText = "No live verification session attached. Upload a document to perform real verification.";
  }

  const handleFixIssues = () => {
    if (onBackToUpload) {
      onBackToUpload();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfb]">
      {/* Top Navigation */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button
            onClick={onBackToUpload}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back to upload
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <ShieldCheck size={18} className="text-teal-700" />
            VeriDoc
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                Verification complete
              </p>

              <h1 className="heading-font mt-2 text-3xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
                Verification Results
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Automated Preliminary Verification · Reviewed just now
              </p>
            </div>

            <button
              onClick={onBackToUpload}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Verify another document
            </button>
          </div>
        </div>

        {/* Readiness Score */}
        <ReadinessScore
          score={score}
          verified={verifiedCount}
          warnings={warningCount}
          missing={missingCount}
        />

        {/* Documents */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Document verification
            </p>

            <h2 className="heading-font mt-1 text-xl font-bold text-gray-900">
              Documents reviewed
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayDocs.map((doc, idx) => (
              <DocumentCard
                key={`${doc.type}-${idx}`}
                filename={doc.filename}
                type={doc.type}
                status={doc.status}
                confidence={doc.confidence}
                message={doc.message}
                onViewDetails={() => setSelectedDocument(doc)}
              />
            ))}
          </div>
        </section>

        {/* Issues */}
        {displayIssues.length > 0 && (
          <section className="mt-12">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Attention required
              </p>

              <h2 className="heading-font mt-1 text-xl font-bold text-gray-900">
                Issues / Flags
              </h2>
            </div>

            <div className="space-y-4">
              {displayIssues.map((issue, idx) => (
                <IssueCard
                  key={`${issue.title}-${idx}`}
                  severity={issue.severity}
                  title={issue.title}
                  description={issue.description}
                  recommendation={issue.recommendation}
                />
              ))}
            </div>
          </section>
        )}

        {/* AI Explanation */}
        <section className="mt-12">
          <AIExplanation
            explanation={explanationText}
            score={score}
            issues={displayIssues.map((i) => i.description)}
          />
        </section>

        {/* Action CTA */}
        <section className="mt-10 overflow-hidden rounded-2xl bg-gray-950 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Verification complete
              </p>

              <h2 className="heading-font mt-2 text-2xl font-bold">
                Need to process another document?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Upload additional certificates or documents to obtain real-time automated verification scores and extracted field reports.
              </p>
            </div>

            <button
              onClick={handleFixIssues}
              className="group flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-gray-900 transition hover:bg-teal-50"
            >
              Upload New Document
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </button>
          </div>
        </section>

        {/* Footer note */}
        <div className="py-10 text-center">
          <p className="text-xs text-gray-400">
            VeriDoc provides automated preliminary verification via OCR and pattern matching. It does not guarantee legal authenticity.
          </p>
        </div>
      </main>

      {/* Document Modal showing actual extracted fields */}
      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-5 backdrop-blur-sm"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Real Document Analysis
                </p>

                <h2 className="heading-font mt-1 text-xl font-bold text-gray-900">
                  {selectedDocument.type}
                </h2>
              </div>

              <button
                onClick={() => setSelectedDocument(null)}
                className="rounded-lg px-3 py-1 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                File Name
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {selectedDocument.filename}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400">Status</p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    selectedDocument.status === "verified"
                      ? "text-teal-700"
                      : selectedDocument.status === "warning"
                      ? "text-amber-700"
                      : "text-red-700"
                  }`}
                >
                  {selectedDocument.status === "verified"
                    ? "Verified"
                    : selectedDocument.status === "warning"
                    ? "Needs Attention"
                    : "Invalid / Missing"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400">OCR Confidence</p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {selectedDocument.confidence !== undefined
                    ? `${Math.round(selectedDocument.confidence * 100)}%`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Extracted Fields Table */}
            {selectedDocument.fields && Object.keys(selectedDocument.fields).length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Extracted Fields (OCR)
                </p>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                  {Object.entries(selectedDocument.fields).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2 text-xs">
                      <span className="font-semibold text-gray-500 uppercase tracking-wider">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium text-gray-900 text-right">
                        {val ? String(val) : <em className="text-gray-400">null</em>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Checks */}
            {selectedDocument.checks && selectedDocument.checks.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Automated Checks
                </p>
                <div className="space-y-2">
                  {selectedDocument.checks.map((chk, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-gray-100 bg-white">
                      <span className="font-medium text-gray-700">{chk.name}</span>
                      <span className={`font-bold ${chk.passed ? "text-teal-700" : "text-red-600"}`}>
                        {chk.passed ? "✓ Passed" : "✗ Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedDocument(null)}
              className="mt-7 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}