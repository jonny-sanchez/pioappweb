import { Supervisor } from "../types/Supervisor";
import { authFetch } from "../utils/auth-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getAllSupervisors(): Promise<Supervisor[]> {
  const response = await authFetch(`/users/getAllSupervisors`,
    {
      headers: getAuthHeaders()
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener supervisores");
  }
  return response.json();
}

export async function getSupervisorBycodEmpleado(codE: string): Promise<Supervisor> {
  const response = await authFetch(`/supervisores/getSupervisorBycodEmpleado/${codE}`,
    {
      headers: getAuthHeaders()
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener supervisor");
  }
  return response.json();
}