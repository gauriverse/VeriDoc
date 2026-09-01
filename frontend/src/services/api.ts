import axios from "axios";

export interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface SingleVerificationResult {
  id?: string;
  filename?: string;
  status: "VERIFIED" | "REVIEW_REQUIRED" | "INVALID";
  score: number;
  document_type: string;
  confidence: number;
  fields: Record<string, any>;
  checks: VerificationCheck[];
  warnings: string[];
  disclaimer: string;
}

export interface ApplicationVerificationResult {
  application_id?: string;
  readiness_score: number;
  readiness_status: string;
  score_breakdown?: Record<string, any>;
  summary: {
    verified: number;
    warnings: number;
    missing: number;
    failed: number;
  };
  documents: Array<{
    id: string;
    filename: string;
    type: string;
    status: string;
    confidence?: number;
    fields?: Record<string, any>;
    issues?: any[];
  }>;
  issues: any[];
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function verifySingleDocument(
  file: File
): Promise<SingleVerificationResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<SingleVerificationResult>(
    "/documents/verify",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function uploadDocuments(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function verifyApplication(
  applicationId: string
): Promise<ApplicationVerificationResult> {
  const response = await api.post<ApplicationVerificationResult>(
    `/applications/${applicationId}/verify`
  );

  return response.data;
}

export async function getResults(
  applicationId: string
): Promise<ApplicationVerificationResult> {
  const response = await api.get<ApplicationVerificationResult>(
    `/applications/${applicationId}/results`
  );

  return response.data;
}

export default api;