import { useState } from "react";

import Landing from "./pages/Landing";
import Results from "./pages/Results";

type Page = "landing" | "results";

function App() {
  const [page, setPage] = useState<Page>("results");

  return (
    <>
      {page === "landing" && (
        <Landing
          onStart={() => {
            setPage("results");
          }}
        />
      )}

      {page === "results" && (
        <Results
          onBackToUpload={() => {
            setPage("landing");
          }}
        />
      )}
    </>
  );
}

export default App;