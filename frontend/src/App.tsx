import { useState } from "react";

import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import type { VerificationResultData } from "./pages/Upload";
import Results from "./pages/Results";

type Page = "landing" | "upload" | "results";

function App() {
  const [page, setPage] = useState<Page>("landing");
  const [result, setResult] = useState<VerificationResultData | null>(null);

  const handleVerificationComplete = (res: VerificationResultData) => {
    setResult(res);
    setPage("results");
  };

  return (
    <>
      {page === "landing" && (
        <Landing
          onStart={() => {
            setPage("upload");
          }}
        />
      )}

      {page === "upload" && (
        <Upload
          onStart={() => setPage("landing")}
          onVerificationComplete={handleVerificationComplete}
        />
      )}

      {page === "results" && (
        <Results
          result={result}
          onBackToUpload={() => {
            setPage("upload");
          }}
        />
      )}
    </>
  );
}

export default App;