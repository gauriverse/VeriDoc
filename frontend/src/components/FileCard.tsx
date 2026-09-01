import {
    CheckCircle2,
    FileText,
    X,
  } from "lucide-react";
  
  interface FileCardProps {
    file: File;
    onRemove: () => void;
  }
  
  export default function FileCard({
    file,
    onRemove,
  }: FileCardProps) {
    const size = (file.size / 1024 / 1024).toFixed(1);
  
    return (
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            <FileText size={19} />
          </div>
  
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {size} MB · Ready for verification
            </p>
          </div>
        </div>
  
        <div className="ml-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-teal-600" />
  
          <button
            onClick={onRemove}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={17} />
          </button>
        </div>
      </div>
    );
  }