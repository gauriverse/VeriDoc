export const mockResult = {
    application_id: "APP-001",
  
    readiness_score: 72,
  
    summary: {
      verified: 3,
      warnings: 1,
      missing: 1,
    },
  
    documents: [
      {
        id: "DOC-001",
        filename: "PAN.jpg",
        type: "PAN",
        status: "verified",
        confidence: 0.97,
        fields: {
          name: "Gauri Bhushan Potdar",
          pan: "XXXXX1234X",
        },
        issues: [],
      },
  
      {
        id: "DOC-002",
        filename: "Aadhaar.jpg",
        type: "AADHAAR",
        status: "verified",
        confidence: 0.95,
        fields: {
          name: "Gauri Bhushan Potdar",
        },
        issues: [],
      },
  
      {
        id: "DOC-003",
        filename: "AddressProof.jpg",
        type: "ADDRESS_PROOF",
        status: "warning",
        confidence: 0.91,
        fields: {
          name: "Gauri B Potdar",
        },
        issues: [
          "Name mismatch detected",
        ],
      },
    ],
  
    issues: [
      {
        type: "NAME_MISMATCH",
        severity: "warning",
        message: "Name differs between PAN and Address Proof",
        recommendation: "Verify the spelling",
      },
      {
        type: "MISSING_DOCUMENT",
        severity: "error",
        message: "Business Registration is missing",
        recommendation: "Upload the required document",
      },
      {
        type: "MISSING_DOCUMENT",
        severity: "error",
        message: "Photograph is missing",
        recommendation: "Upload a recent photograph",
      },
    ],
  
    explanation:
      "Your application is currently 72% ready. We found 3 issues that may delay processing. Resolve these issues before submission.",
  };