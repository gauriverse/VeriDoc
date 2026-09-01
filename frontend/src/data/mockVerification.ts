export type DocumentStatus =
  | "verified"
  | "warning"
  | "missing";

export interface VerificationDocument {
  id: string;
  filename: string;
  type: string;
  status: DocumentStatus;
  confidence?: number;
  message?: string;
  fields?: {
    label: string;
    value: string;
    status: "valid" | "warning";
  }[];
}

export interface VerificationIssue {
  id: string;
  severity: "warning" | "error";
  title: string;
  description: string;
  recommendation: string;
}

export const verificationData = {
  applicationId: "APP-001",

  reviewedAt: "Reviewed just now",

  score: 72,

  summary: {
    verified: 2,
    warnings: 1,
    missing: 2,
  },

  documents: [
    {
      id: "pan",
      filename: "PAN.jpg",
      type: "PAN Card",
      status: "verified" as const,
      confidence: 0.97,

      fields: [
        {
          label: "Full Name",
          value: "Krutika Sankapal",
          status: "valid" as const,
        },
        {
          label: "PAN Number",
          value: "ABCDE1234F",
          status: "valid" as const,
        },
        {
          label: "Date of Birth",
          value: "12 May 2004",
          status: "valid" as const,
        },
      ],
    },

    {
      id: "aadhaar",
      filename: "Aadhaar.jpg",
      type: "Aadhaar",
      status: "verified" as const,
      confidence: 0.95,

      fields: [
        {
          label: "Full Name",
          value: "Krutika Sankapal",
          status: "valid" as const,
        },
        {
          label: "Aadhaar Number",
          value: "XXXX XXXX 4521",
          status: "valid" as const,
        },
        {
          label: "Address",
          value: "Maharashtra, India",
          status: "valid" as const,
        },
      ],
    },

    {
      id: "address",
      filename: "AddressProof.jpg",
      type: "Address Proof",
      status: "warning" as const,
      confidence: 0.91,

      message:
        "Possible name mismatch detected between this document and the PAN Card.",

      fields: [
        {
          label: "Full Name",
          value: "Krutika K. Sankapal",
          status: "warning" as const,
        },
        {
          label: "Address",
          value: "Maharashtra, India",
          status: "valid" as const,
        },
        {
          label: "Document Type",
          value: "Address Proof",
          status: "valid" as const,
        },
      ],
    },

    {
      id: "business",
      filename: "BusinessRegistration.pdf",
      type: "Business Registration",
      status: "missing" as const,

      fields: [],
    },

    {
      id: "photo",
      filename: "Photograph.jpg",
      type: "Photograph",
      status: "missing" as const,

      fields: [],
    },
  ] as VerificationDocument[],

  issues: [
    {
      id: "name-mismatch",
      severity: "warning" as const,
      title: "Name mismatch",

      description:
        "The name on your Address Proof differs from the name detected on your PAN Card.",

      recommendation:
        "Verify the spelling and ensure the documents belong to the same applicant.",
    },

    {
      id: "business-registration",
      severity: "error" as const,
      title: "Business Registration missing",

      description:
        "A required Business Registration document was not found in the uploaded files.",

      recommendation:
        "Upload your valid Business Registration document before submission.",
    },

    {
      id: "photograph",
      severity: "error" as const,
      title: "Photograph missing",

      description:
        "A required applicant photograph has not been uploaded.",

      recommendation:
        "Upload a recent photograph that meets the application requirements.",
    },
  ] as VerificationIssue[],

  aiIssues: [
    "Business Registration is missing.",
    "The name on your Address Proof differs from your PAN.",
    "Photograph has not been uploaded.",
  ],
};