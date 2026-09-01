import { useState } from "react";
import { ArrowRight, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import UploadZone from "../components/UploadZone";
import FileCard from "../components/FileCard";
import RequiredChecklist from "../components/RequiredChecklist";
import {
  verifySingleDocument,
  uploadDocuments,
  verifyApplication,
} from "../services/api";
import type {
  SingleVerificationResult,
  ApplicationVerificationResult,
} from "../services/api";

export type VerificationResultData =
  | { type: "single"; data: SingleVerificationResult; file: File }
  | { type: "application"; data: ApplicationVerificationResult };

interface UploadProps {
  onStart?: () => void;
  onVerificationComplete: (result: VerificationResultData) => void;
}

export default function Upload({ onVerificationComplete }: UploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList) return;
    setErrorMessage(null);
    const newFiles = Array.from(filesList);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleVerify = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("Please select at least one document file to verify.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (selectedFiles.length === 1) {
        // Single document flow
        const file = selectedFiles[0];
        const result = await verifySingleDocument(file);
        onVerificationComplete({ type: "single", data: result, file });
      } else {
        // Multi document application flow
        const uploadRes = await uploadDocuments(selectedFiles);
        const appId = uploadRes.application_id;
        const result = await verifyApplication(appId);
        onVerificationComplete({ type: "application", data: result });
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      let msg = "Verification failed.";
      if (err?.response?.data?.detail) {
        msg =
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
      } else if (err?.message) {
        msg = err.message;
      }

      if (msg.includes("Network Error") || msg.includes("ECONNREFUSED")) {
        msg =
          "Network Error: Unable to reach FastAPI backend server. Please verify that the backend server is running on port 8000 (e.g. run `uvicorn app.main:app --port 8000 --reload` in the backend folder).";
      }

      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfb]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
            <Sparkles size={15} />
            Automated preliminary verification
          </div>

          <h1 className="heading-font text-4xl font-extrabold tracking-tight text-gray-950 md:text-5xl">
            Upload Your Documents
          </h1>

          <p className="mt-3 max-w-xl mx-auto text-base text-gray-600">
            Select your PAN card, identity document, income or educational certificates to run instant OCR and verification.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main Upload Area */}
          <div className="space-y-6">
            <UploadZone onFilesSelected={handleFilesSelected} />

            {/* File List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedFiles.map((file, idx) => (
                    <FileCard
                      key={`${file.name}-${idx}`}
                      file={file}
                      onRemove={() => handleRemoveFile(idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
                <div className="text-sm">
                  <p className="font-semibold">Verification Error</p>
                  <p className="mt-1 leading-5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                onClick={handleVerify}
                disabled={selectedFiles.length === 0 || isProcessing}
                className={`group flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-white shadow-sm transition ${
                  selectedFiles.length === 0 || isProcessing
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing with OCR...
                  </>
                ) : (
                  <>
                    Verify Documents
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RequiredChecklist uploadedCount={selectedFiles.length} />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-500">
              <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                <ShieldCheck size={16} className="text-teal-700" />
                Automated Verification Notice
              </div>
              This tool performs preliminary OCR check & automated field extraction. Results do not guarantee legal authenticity.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
