export interface CasoModel {
  id_caso?: string;
  id_tienda: string;
  tienda_nombre:string;
  id_empresa: string;
  division: number;
  id_tipo_solicitud: number;
  id_estado: number;
  id_impacto: number;
  id_urgencia: number;
  id_categoria: number;
  id_subcategoria: number;
  mensaje: string;
  userCreatedAt?: number;
  userUpdatedAt?: number;
  createdAt?: string;
  updatedAt?: string;
  correlativo?: number;
}

export interface VwDetalleCaso {
  id_caso: string;
  id_tienda: string;
  tienda_nombre: string;
  id_empresa: string;
  division: number;
  tipo_solicitud: string;
  estado: string;
  impacto: string;
  urgencia: string;
  categoria: string;
  subcategoria: string;
  mensaje: string;
  correlativo: number;
  createdAt: Date;
  updatedAt: Date;
  creador?: string;
}