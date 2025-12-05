import { TiendaModulo } from "../types/TiendaModulo";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getAllTiendas(cod_tienda: string): Promise<TiendaModulo[]> {
  const response = await fetch(
    `${BASE_URL}/tiendas/getAllTiendas/${cod_tienda}`,
    {
      headers: getAuthHeaders()
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener tiendas");
  }
  return response.json();
}