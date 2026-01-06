export interface VisitaEmergencia {
  id_visita?: number,
  empresa: string;
  tienda: string;
  tienda_nombre: string;
  tienda_direccion?: string;
  id_tipo_visita: number;
  last_gps_longitude?: string | null;
  last_gps_latitude?: string | null;
  new_gps_longitude: string;
  new_gps_latitude: string;
  comentario: string | null;
  id_estado: number;
  fecha_programacion: Date;
  user_asignado: string;
  nombre_user_asignado: string,
  userCreatedAt?: number | null;
  userUpdatedAt?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  id_caso: string;
  division: number;
  EstadoVisitaEmergenciaModel?: {
    id_estado: number;
    nombre: string;
    descripcion: string;
  }
}

export interface VwDetalleVisitaEmergencia {
  id_visita: number;
  estado: string;
  nombre_user_asignado: string;
  tienda_nombre: string;
  tipo_visita: string;
  fecha_programacion: Date;
  comentario: string;
  last_gps_longitude?: string | null;
  last_gps_latitude?: string | null;
  new_gps_longitude: string;
  new_gps_latitude: string;
  division: number;
}