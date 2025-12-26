import {
  ArrowLeft,
  User,
  MapPin,
  AlertCircle,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  Loader2,
  Flag } from "lucide-react";
import { MapView } from "./MapView";
import { useState, useEffect } from "react";
import { VwDetalleVisitaEmergencia } from "./types/VisitaEmergencia";
import { getVisitasEmergenciaById } from "./api/VisitaApi";

interface EmergencyVisitDetailProps {
  visit: VwDetalleVisitaEmergencia;
  onBack: () => void;
}

export function EmergencyVisitDetail({ visit, onBack }: EmergencyVisitDetailProps) {
  const [confirmationStatus, setConfirmationStatus] = useState<"waiting" | "confirmed" | "finished" | null>(null);
  const [timeEstimate, setTimeEstimate] = useState<string | null>(null);
  const [lastGpsLat, setLastGpsLat] = useState<number | null>(
  visit.last_gps_latitude !== null
    ? Number(visit.last_gps_latitude)
    : null
);

const [lastGpsLng, setLastGpsLng] = useState<number | null>(
  visit.last_gps_longitude !== null
    ? Number(visit.last_gps_longitude)
    : null
);


  useEffect(() => {
      const visitaId = visit.id_visita.toString();
      const interval = setInterval(async () => {
        try {
          const updatedVisita = await getVisitasEmergenciaById(visitaId);
          if (!updatedVisita) return;
          if (updatedVisita.last_gps_latitude && updatedVisita.last_gps_longitude) {
            setLastGpsLat(Number(updatedVisita.last_gps_latitude));
            setLastGpsLng(Number(updatedVisita.last_gps_longitude));
          }
          if (updatedVisita?.id_estado === 2) {
            setConfirmationStatus("confirmed");
          } else if (updatedVisita?.id_estado === 1) {
            setConfirmationStatus("waiting");
          } else if(updatedVisita?.id_estado === 3) {
            setConfirmationStatus("finished");
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error al consultar estado de la visita:", err);
        }
      }, 5000);
  
      return () => clearInterval(interval);
    }, [visit.id_visita]);

  const lastVisitLocation =
  lastGpsLat !== null && lastGpsLng !== null
    ? {
        lat: lastGpsLat,
        lng: lastGpsLng,
        name: "Última visita",
      }
    : null;


  const newVisitLocation = {
    lat: Number(visit.new_gps_latitude),
    lng: Number(visit.new_gps_longitude),
    name: "Destino",
  };

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) {
      return "Fecha no disponible";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return new Intl.DateTimeFormat("es-GT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-50 text-red-700 border-red-200";
      case "in-progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En Progreso";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10">
      <div className="mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a la lista</span>
        </button>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Visita de Emergencia</h1>
                <p className="text-gray-600">{visit.id_visita}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg border ${getStatusColor(visit.estado)}`}>
              {getStatusText(visit.estado)}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Detalles de la Visita</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Supervisor</p>
                    <p className="text-gray-900">{visit.nombre_user_asignado}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Tienda</p>
                    <p className="text-gray-900">{visit.tienda_nombre}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Tipo de Visita</p>
                    <p className="text-gray-900">{visit.tipo_visita}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-600 text-sm mb-1">Fecha y Hora de Asignación</p>
                    <p className="text-yellow-900">{formatDateTime(visit.fecha_programacion)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-600 text-sm mb-1">Objetivo de la Visita</p>
                    <p className="text-blue-900">{visit.comentario}</p>
                  </div>
                </div>
              </div>
              {confirmationStatus === "waiting" && (
                <div className="bg-gray-100 rounded-xl p-3 border border-gray-300">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-gray-600 mr-2 animate-spin" />
                    <p className="text-gray-700">En espera de confirmación</p>
                  </div>
                </div>
              )}
              {confirmationStatus === "confirmed" && (
                <>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center justify-center">
                      <Flag className="w-5 h-5 text-blue-600 mr-2" />
                      <p className="text-blue-700">Supervisor confirma visita</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-xl p-2 border border-yellow-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-900 mr-3" />
                        <p className="text-gray-900">Hora estimada de llegada</p>
                      </div>
                      <p className="text-gray-900">{timeEstimate}</p>
                    </div>
                  </div>
                </>
              )}
              {confirmationStatus === "finished" && (
                <div className="bg-gray-100 rounded-xl p-3 border border-gray-300">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gray-600 mr-2" />
                    <p className="text-gray-700">Visita Finalizada</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:sticky lg:top-4">
          <h2 className="text-gray-900 mb-4 text-center">Ubicaciones</h2>
          <div className="h-[600px]">
            <MapView
              lastVisit={lastVisitLocation}
              newVisit={{
                lat: Number(visit.new_gps_latitude),
                lng: Number(visit.new_gps_longitude),
                name: "Destino",
              }}
              onTimeCalculated={(eta) => setTimeEstimate(eta)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}