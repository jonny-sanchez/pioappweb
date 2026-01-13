export interface User {
  id_users: number;
  codigo_user: string;
  id_rol: number;
  first_name: string;
  second_name?: string;
  first_last_name?: string;
  second_last_name?: string;
  email: string;
  password: string;
  dpi: string;
  fecha_nacimiento: string;
  direccion: string;
  puesto_trabajo: string;
  userCreatedAt?: number;
  userUpdatedAt?: number;
  createdAt?: string;
  updatedAt?: string;
  division?: 1 | 2;
}