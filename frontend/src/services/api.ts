import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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
) {
  const response = await api.post(
    `/applications/${applicationId}/verify`
  );

  return response.data;
}

export async function getResults(
  applicationId: string
) {
  const response = await api.get(
    `/applications/${applicationId}/results`
  );

  return response.data;
}

export default api;