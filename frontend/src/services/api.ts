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

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use current host or default to localhost:8000/api
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return "http://localhost:8000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export async function verifySingleDocument(
  file: File
): Promise<SingleVerificationResult> {
  const formData = new FormData();
  formData.append("file", file);

  // Let browser/Axios automatically set Content-Type header with multipart boundary
  const response = await api.post<SingleVerificationResult>(
    "/documents/verify",
    formData
  );

  return response.data;
}

export async function uploadDocuments(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  // Let browser/Axios automatically set Content-Type header with multipart boundary
  const response = await api.post(
    "/documents/upload",
    formData
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