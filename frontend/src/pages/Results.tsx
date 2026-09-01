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

interface ResultsProps {
  onBackToUpload?: () => void;
}

interface SelectedDocument {
  filename: string;
  type: string;
  status: "verified" | "warning" | "missing";
  confidence?: number;
}

const documents: SelectedDocument[] = [
  {
    filename: "PAN.jpg",
    type: "PAN Card",
    status: "verified",
    confidence: 0.97,
  },
  {
    filename: "Aadhaar.jpg",
    type: "Aadhaar",
    status: "verified",
    confidence: 0.95,
  },
  {
    filename: "AddressProof.jpg",
    type: "Address Proof",
    status: "warning",
    confidence: 0.91,
  },
  {
    filename: "BusinessRegistration.pdf",
    type: "Business Registration",
    status: "missing",
  },
  {
    filename: "Photograph.jpg",
    type: "Photograph",
    status: "missing",
  },
];

const issues = [
  {
    severity: "warning" as const,
    title: "Name mismatch",
    description:
      "The name on your Address Proof differs from the name detected on your PAN Card.",
    recommendation:
      "Verify the spelling and ensure the documents belong to the same applicant.",
  },
  {
    severity: "error" as const,
    title: "Business Registration missing",
    description:
      "A required Business Registration document was not found in the uploaded files.",
    recommendation:
      "Upload your valid Business Registration document before submission.",
  },
  {
    severity: "error" as const,
    title: "Photograph missing",
    description:
      "A required applicant photograph has not been uploaded.",
    recommendation:
      "Upload a recent photograph that meets the application requirements.",
  },
];

export default function Results({
  onBackToUpload,
}: ResultsProps) {
  const [selectedDocument, setSelectedDocument] =
    useState<SelectedDocument | null>(null);

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
            <ShieldCheck
              size={18}
              className="text-teal-700"
            />

            DocSure
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
                Application APP-001 · Reviewed just now
              </p>
            </div>

            <button
              onClick={onBackToUpload}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Verify again
            </button>
          </div>
        </div>

        {/* Readiness Score */}
        <ReadinessScore
          score={72}
          verified={2}
          warnings={1}
          missing={2}
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
            {documents.map((document) => (
              <DocumentCard
                key={document.type}
                filename={document.filename}
                type={document.type}
                status={document.status}
                confidence={document.confidence}
                message={
                  document.status === "warning"
                    ? "Possible name mismatch detected."
                    : document.status === "missing"
                    ? "Required document was not found."
                    : undefined
                }
                onViewDetails={() =>
                  setSelectedDocument(document)
                }
              />
            ))}
          </div>
        </section>

        {/* Issues */}
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Attention required
            </p>

            <h2 className="heading-font mt-1 text-xl font-bold text-gray-900">
              Issues to fix
            </h2>
          </div>

          <div className="space-y-4">
            {issues.map((issue) => (
              <IssueCard
                key={issue.title}
                severity={issue.severity}
                title={issue.title}
                description={issue.description}
                recommendation={issue.recommendation}
              />
            ))}
          </div>
        </section>

        {/* AI Explanation */}
        <section className="mt-12">
          <AIExplanation
            score={72}
            issues={[
              "Business Registration is missing.",
              "The name on your Address Proof differs from your PAN.",
              "Photograph has not been uploaded.",
            ]}
          />
        </section>

        {/* Fix CTA */}
        <section className="mt-10 overflow-hidden rounded-2xl bg-gray-950 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Almost there
              </p>

              <h2 className="heading-font mt-2 text-2xl font-bold">
                Fix the issues before submission.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Upload the missing documents and resolve the
                flagged information to improve your readiness score.
              </p>
            </div>

            <button
              onClick={handleFixIssues}
              className="group flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-gray-900 transition hover:bg-teal-50"
            >
              Fix These Issues

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
            DocSure AI provides automated verification assistance.
            Always review your documents before final submission.
          </p>
        </div>
      </main>

      {/* Document Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-5 backdrop-blur-sm"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Document details
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
                File
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {selectedDocument.filename}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400">
                  Status
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    selectedDocument.status === "verified"
                      ? "text-teal-700"
                      : selectedDocument.status ===
                        "warning"
                      ? "text-amber-700"
                      : "text-red-700"
                  }`}
                >
                  {selectedDocument.status === "verified"
                    ? "Verified"
                    : selectedDocument.status === "warning"
                    ? "Needs Attention"
                    : "Missing"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400">
                  AI Confidence
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {selectedDocument.confidence
                    ? `${Math.round(
                        selectedDocument.confidence * 100
                      )}%`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold text-gray-900">
                Validation
              </p>

              <div className="mt-3 space-y-2">
                {selectedDocument.status ===
                "verified" ? (
                  <>
                    <ValidationRow text="Document type detected" />
                    <ValidationRow text="Document is readable" />
                    <ValidationRow text="Required fields found" />
                    <ValidationRow text="Information validated" />
                  </>
                ) : selectedDocument.status ===
                  "warning" ? (
                  <>
                    <ValidationRow text="Document type detected" />
                    <ValidationRow text="Document is readable" />
                    <ValidationRow
                      text="Possible name mismatch"
                      warning
                    />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    This required document has not been
                    uploaded.
                  </p>
                )}
              </div>
            </div>

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

function ValidationRow({
  text,
  warning = false,
}: {
  text: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
          warning
            ? "bg-amber-50 text-amber-700"
            : "bg-teal-50 text-teal-700"
        }`}
      >
        {warning ? "!" : "✓"}
      </div>

      <span className="text-gray-600">{text}</span>
    </div>
  );
}