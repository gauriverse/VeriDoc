// VeriDoc document verification checklist

import {
    CheckCircle2,
    Circle,
  } from "lucide-react";
  
  interface ChecklistProps {
    uploadedCount: number;
  }
  
  const documents = [
    { name: "PAN Card", required: true },
    { name: "Aadhaar", required: true },
    { name: "Address Proof", required: true },
    { name: "Business Registration", required: true },
    { name: "Photograph", required: true },
  ];
  
  export default function RequiredChecklist({
    uploadedCount,
  }: ChecklistProps) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Application checklist
        </p>
  
        <div className="mt-5 space-y-4">
          {documents.map((document, index) => {
            const uploaded = index < uploadedCount;
  
            return (
              <div
                key={document.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {uploaded ? (
                    <CheckCircle2
                      size={18}
                      className="text-teal-600"
                    />
                  ) : (
                    <Circle size={18} className="text-gray-300" />
                  )}
  
                  <span
                    className={`text-sm ${
                      uploaded
                        ? "font-medium text-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    {document.name}
                  </span>
                </div>
  
                {!uploaded && (
                  <span className="text-xs text-gray-400">
                    Required
                  </span>
                )}
              </div>
            );
          })}
        </div>
  
        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Documents uploaded</span>
            <span className="font-bold text-gray-900">
              {Math.min(uploadedCount, 5)} / 5
            </span>
          </div>
  
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{
                width: `${Math.min((uploadedCount / 5) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }