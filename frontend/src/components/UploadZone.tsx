import { FileUp, UploadCloud } from "lucide-react";
import { useRef } from "react";

interface UploadZoneProps {
  onFilesSelected: (files: FileList | null) => void;
}

export default function UploadZone({
  onFilesSelected,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-14 text-center transition hover:border-teal-500 hover:bg-teal-50/30"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <UploadCloud size={28} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        Drag & drop your documents
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        or click to browse files
      </p>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
        <FileUp size={14} />
        PDF, JPG, JPEG, PNG · Max 10 MB per file
      </div>
    </div>
  );
}