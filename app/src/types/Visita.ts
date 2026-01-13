export interface Visita {
  id_visita: number;
  codigo_empresa: string;
  codigo_tienda: string;
  tienda_nombre: string;
  direccion_tienda: string;
  tipo_visita: string;
  fecha_hora_visita: string;
  codigo_usuario_visita: string;
  gps_longitud_visita: number;
  gps_latitud_visita: number;
  comentario: string;
  createdAt: string;
  updatedAt: string;
  url_image: string
}

export interface Vw_visita_pioapp {
  codigo_empresa: string;
  codigo_tienda: string;
  nombre_tienda: string;
  direccion_tienda: string;
  tipo_visita: string;
  fecha_hora_visita: string;
  codigo_usuario_visita: string;
  gps_longitud_visita: number;
  gps_latitud_visita: number;
  comentario_visita: string
}