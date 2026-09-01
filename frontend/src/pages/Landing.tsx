import {
    ArrowRight,
    CheckCircle2,
    FileSearch,
    ShieldCheck,
    Sparkles,
  } from "lucide-react";
  import Navbar from "../components/Navbar";
  
  interface LandingProps {
    onStart: () => void;
  }
  
  export default function Landing({ onStart }: LandingProps) {
    return (
      <div className="min-h-screen bg-[#fafcfb]">
        <Navbar onStart={onStart} />
  
        <main>
          <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pt-28">
            <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
              
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <Sparkles size={15} />
                  Smarter document verification
                </div>
  
                <h2 className="heading-font max-w-3xl text-5xl font-800 leading-[1.08] tracking-tight text-gray-950 md:text-6xl">
                  Verify before you
                  <span className="text-teal-700"> submit.</span>
                </h2>
  
                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                  DocSure checks your documents for missing information,
                  inconsistencies, quality issues and validation errors before
                  they cause delays.
                </p>
  
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={onStart}
                    className="group flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-800"
                  >
                    Start Verification
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </button>
  
                  <a
                    href="#how-it-works"
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:border-gray-400"
                  >
                    See how it works
                  </a>
                </div>
  
                <div className="mt-8 flex flex-wrap gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-teal-600" />
                    OCR analysis
                  </span>
  
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-teal-600" />
                    Smart validation
                  </span>
  
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-teal-600" />
                    Cross-document checks
                  </span>
                </div>
              </div>
  
              <div className="relative">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Verification preview
                      </p>
                      <h3 className="mt-1 heading-font text-xl font-bold text-gray-900">
                        Application status
                      </h3>
                    </div>
  
                    <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Needs attention
                    </div>
                  </div>
  
                  <div className="mb-7 flex items-center gap-6">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-teal-100 border-t-teal-700">
                      <div className="text-center">
                        <p className="heading-font text-3xl font-800 text-gray-900">
                          72%
                        </p>
                        <p className="text-[10px] font-semibold uppercase text-gray-400">
                          Ready
                        </p>
                      </div>
                    </div>
  
                    <div>
                      <p className="text-sm text-gray-500">
                        3 verified · 1 warning · 1 missing
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        Almost ready to submit
                      </p>
                    </div>
                  </div>
  
                  {[
                    ["PAN Card", "Verified"],
                    ["Aadhaar", "Verified"],
                    ["Address Proof", "Review"],
                  ].map(([name, status]) => (
                    <div
                      key={name}
                      className="mb-3 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileSearch size={18} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-800">
                          {name}
                        </span>
                      </div>
  
                      <span
                        className={`text-xs font-semibold ${
                          status === "Verified"
                            ? "text-teal-700"
                            : "text-amber-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
  
          <section
            id="how-it-works"
            className="border-y border-gray-200 bg-white"
          >
            <div className="mx-auto max-w-7xl px-6 py-16">
              <div className="mb-10 max-w-xl">
                <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
                  How it works
                </p>
  
                <h3 className="heading-font mt-2 text-3xl font-800 text-gray-900">
                  From upload to ready-to-submit.
                </h3>
              </div>
  
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    icon: FileSearch,
                    title: "Upload",
                    text: "Add all documents required for your application.",
                  },
                  {
                    icon: Sparkles,
                    title: "Analyze",
                    text: "AI extracts information and checks every document.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Verify",
                    text: "Get a readiness score and clear actions to fix issues.",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
  
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-200 p-6"
                    >
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <Icon size={21} />
                      </div>
  
                      <div className="mb-2 text-xs font-bold text-gray-400">
                        0{index + 1}
                      </div>
  
                      <h4 className="heading-font text-lg font-bold text-gray-900">
                        {item.title}
                      </h4>
  
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }