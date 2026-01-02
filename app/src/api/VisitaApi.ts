import { TipoVisita } from "../types/TipoVisita";
import { Visita, Vw_visita_pioapp } from "../types/Visita";
import { VisitaEmergencia, VwDetalleVisitaEmergencia } from "../types/VisitaEmergencia";
import { authFetch } from "../utils/auth-fetch";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getVisitaBySupervisor(
  codigoUsuario: string,
  fechaInicio: string,
  fechaFin: string
): Promise<Vw_visita_pioapp[]> {
  const response = await authFetch(
    `/visitas/getVisitaBySupervisor/${codigoUsuario}?startDate=${fechaInicio}&endDate=${fechaFin}`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener visitas por supervisor");
  }
  return response.json();
}

export async function getLastVisitaBySupervisor(codigoUsuario: string): Promise<Visita | null> {
  const response = await authFetch(
    `/visitas/getUltimaVisitaBySupervisor/${codigoUsuario}`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener la última visita por supervisor");
  }

  return response.json();
}

export async function getTiposVisita(): Promise<TipoVisita[]> {
  const response = await authFetch(
    `/visitas/getTiposVisita`,
    {
      headers: getAuthHeaders()
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener tipos de visita");
  }
  return response.json();
}

export async function createVisitaEmergencia(data: VisitaEmergencia) {
  const response = await authFetch(`/visitas/createVisitaEmergencia`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Error al crear visita de emergencia");
  }

  return response.json();
}

export async function getVisitasEmergenciaById(id_visita: string): Promise<VisitaEmergencia | null> {
  console.log(id_visita)
  const response = await authFetch(
    `/visitas/getVisitasEmergenciaById/${id_visita}`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener la visita de emergencia");
  }
  return response.json();
}

export async function getVisitasEmergenciaByCaso(id_caso: string): Promise<VwDetalleVisitaEmergencia | null> {
  const response = await authFetch(`/visitas/getVisitasEmergenciaByCaso/${id_caso}`);

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error("Error al obtener visita");
  }

  return response.json();
}


export async function getVisitasEmergencia(): Promise<VwDetalleVisitaEmergencia[]> {
  const response = await authFetch(
    `/visitas/getVisitasEmergencia`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener las visitas de emergencia");
  }

  return response.json();
}

export async function getVisitaByVisitaEmergencia(id_ve: number): Promise<Visita | null> {
  const response = await authFetch(`/visitas/getVisitaByVisitaEmergencia/${id_ve}`);

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error("Error al obtener visita");
  }

  return response.json();
}