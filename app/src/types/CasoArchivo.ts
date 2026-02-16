export interface CasoArchivoModel {
    id_archivo?: string;
    id_caso: string;
    s3_bucket: string;
    s3_key: string;
    nombre_original: string;
    mime_type: string;
    bytes: number;
    userCreatedAt: number;
    presignedUrl: string;
}