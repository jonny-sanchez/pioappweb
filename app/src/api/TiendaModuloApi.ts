import { TiendaModulo } from "../types/TiendaModulo";
import { authFetch } from "../utils/auth-fetch";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getAllTiendas(cod_tienda: string): Promise<TiendaModulo[]> {
  const response = await authFetch(
    `/tiendas/getAllTiendas/${cod_tienda}`,
    {
      headers: getAuthHeaders()
    }
    
  );

  if (!response.ok) {
    throw new Error("Error al obtener tiendas");
  }
  return response.json();
}

export async function getTiendaByIdAndEmpresa(cod_tienda: string, cod_empresa: string): Promise<TiendaModulo> {
  const response = await authFetch(
    `/tiendas/getTiendaByIdAndEmpresa/${cod_tienda}/${cod_empresa}`,
    {
      headers: getAuthHeaders()
    }
    
  );
  if (!response.ok) {
    throw new Error("Error al obtener tiendas");
  }
  return response.json();
}