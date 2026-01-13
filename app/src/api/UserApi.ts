import { authFetch } from "../utils/auth-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function updateUser(email: string) {
    const response = await authFetch(`/users/updateUser`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}