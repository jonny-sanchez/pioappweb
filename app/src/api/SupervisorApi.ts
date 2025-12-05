import { Supervisor } from "../types/Supervisor";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getAllSupervisors(): Promise<Supervisor[]> {
  const response = await fetch(`${BASE_URL}/users/getAllSupervisors`,
    {
      headers: getAuthHeaders()
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener supervisores");
  }
  return response.json();
}