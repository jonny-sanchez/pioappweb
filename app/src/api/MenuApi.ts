import { Menu } from "../types/Menu";
import { authFetch } from "../utils/auth-fetch";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getMenuByRol(): Promise<Menu[]> {
  const response = await authFetch("/menus/getMenuByRol",
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener menús");
  }
  return response.json();
}