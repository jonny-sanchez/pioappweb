export interface Visita {
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
  url_image: string
}