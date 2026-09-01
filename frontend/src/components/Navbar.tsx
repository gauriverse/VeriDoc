import { ShieldCheck } from "lucide-react";

interface NavbarProps {
  onStart?: () => void;
}

export default function Navbar({ onStart }: NavbarProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h1 className="heading-font text-lg font-800 text-gray-900">
              VeriDoc
            </h1>
            <p className="-mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
              AI Verification
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 transition hover:text-teal-700"
          >
            How it works
          </a>

          <button
            onClick={onStart}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Start Verification
          </button>
        </nav>
      </div>
    </header>
  );
}
