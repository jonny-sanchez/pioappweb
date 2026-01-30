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
  Flag,
  Camera,
  RefreshCcw, 
  PackagePlus,
  Goal
} from "lucide-react";
import { MapView } from "./MapView";
import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent } from "./ui/dialog";
import { VwDetalleVisitaEmergencia, CasoVisitaReabierta, VisitaEmergencia } from "./types/VisitaEmergencia";
import { Visita } from "./types/Visita";
import { getVisitasEmergenciaById, getVisitaByVisitaEmergencia, getVisitasReabiertas } from "./api/VisitaApi";
import { CasoModel } from "./types/Caso";
import { getCasoById } from "./api/CasoApi";

interface EmergencyVisitDetailProps {
  visit: VwDetalleVisitaEmergencia;
  onBack: () => void;
}

export function EmergencyVisitDetail({ visit, onBack }: EmergencyVisitDetailProps) {
  const [confirmationStatus, setConfirmationStatus] = useState<"waiting" | "confirmed" | "finished" | null>(null);
  const [timeEstimate, setTimeEstimate] = useState<string | null>(null);
  const [visitasReabiertas, setVisitasReabiertas] = useState<CasoVisitaReabierta []>([]);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [lastGpsLat, setLastGpsLat] = useState<number | null>(
    visit.last_gps_latitude !== null ? Number(visit.last_gps_latitude) : null
  );
  const [visita, setVisita] = useState<Visita | null>(null);
  const [visitaActualizada, setVisitaActualizada] = useState<VisitaEmergencia | null>(null);
  const [caso, setCaso] = useState<CasoModel | null>(null);

  const fetchCaso = async () => {
    try {
      const data = await getCasoById(visit.id_caso);
      setCaso(data);
      console.log(data)
    } catch (err) {
      alert("Error al obtener el caso asociado a la visita de emergencia");
    }
  }

  useEffect(() => {
    fetchCaso();
  }, []);

  const [lastGpsLng, setLastGpsLng] = useState<number | null>(
    visit.last_gps_longitude !== null
      ? Number(visit.last_gps_longitude)
      : null
  );

  const ultimaReapertura = useMemo(() => {
    if(!visitasReabiertas || visitasReabiertas.length === 0) {
      return null;
    }

    return [...visitasReabiertas].sort((a, b) =>
      new Date(b.fecha_reapertura).getTime() -
      new Date(a.fecha_reapertura).getTime()
    )[0];
  }, [visitasReabiertas])

  const fetchVisitasReabiertas = async () => {
    const id_visita = visit.id_visita;
    const id_caso = visit.id_caso;
    try {
      const visitasReabiertas = await getVisitasReabiertas(id_visita, id_caso);
      setVisitasReabiertas(visitasReabiertas);
    } catch (err) {
      console.error("Error al consultar visitas reabiertas:", err);
    }    
  }

  //VALIDA SI LA VISITA SE HA REABIERTO
  useEffect(() => {
    fetchVisitasReabiertas();
  }, [visit])

  //VALIDA EL ESTADO DE LA VISITA CADA 5 SEGUNDOS
  useEffect(() => {
    const visitaId = visit.id_visita.toString();
    const interval = setInterval(async () => {
      try {
        
        const updatedVisita = await getVisitasEmergenciaById(visitaId);
        setVisitaActualizada(updatedVisita);
        if (!updatedVisita) return;
        const visit = await getVisitaByVisitaEmergencia(updatedVisita?.id_visita || 0)
        setVisita(visit)
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

  const isEnProceso = visitaActualizada?.updatedAt &&
                      visitaActualizada?.createdAt &&
                      new Date(visitaActualizada.updatedAt) > new Date(visitaActualizada.createdAt);

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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-gray-900">Flujo de la Visita</h2>
          {visitasReabiertas && visitasReabiertas.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
              <RefreshCcw className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs text-orange-700">Visita reabierta</span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-start gap-0 min-w-max mx-auto justify-center px-4">
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fcb900] border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10`}>
                    <PackagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {(visit?.fecha_programacion || visitaActualizada?.updatedAt || visita?.createdAt) && (
                    <div className="absolute left-1/2 top-1/2 w-full h-1 bg-[#fcb900] -translate-y-1/2"></div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-gray-900 text-xs sm:text-sm mb-1">Caso Creado</p>
                  <p className="text-gray-600 text-xs">
                    {formatDateTime(caso?.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fcb900] border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10`}>
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {(visit?.fecha_programacion || visitaActualizada?.updatedAt || visita?.createdAt) && (
                    <div className="absolute left-1/2 top-1/2 w-full h-1 bg-[#fcb900] to-gray-300 -translate-y-1/2"></div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-gray-900 text-xs sm:text-sm mb-1">Asignada</p>
                  <p className="text-gray-600 text-xs">
                    {formatDateTime(visit?.fecha_programacion)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  {!isEnProceso && (
                  <div className="absolute right-1/2 top-1/2 w-full h-1 bg-gray-300 -translate-y-1/2"></div>
                  )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10 ${
                      isEnProceso ? 'bg-[#fcb900]' : 'bg-gray-200'
                      }`}>
                      <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${(isEnProceso) ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {visitaActualizada?.id_estado === 3 && (
                    <div className={`absolute left-1/2 top-1/2 w-full h-1 -translate-y-1/2 bg-[#fcb900]`}></div>
                    )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-xs sm:text-sm mb-1 ${isEnProceso ? 'text-gray-900' : 'text-gray-500'}`}>
                    En Proceso
                  </p>
                  {isEnProceso ? (
                    <p className="text-gray-600 text-xs">
                      {formatDateTime(visitaActualizada?.updatedAt)}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">Pendiente</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  {(!visita?.createdAt || visitaActualizada?.id_estado !== 3) && (
                  <div className="absolute right-1/2 top-1/2 w-full h-1 bg-gray-300 -translate-y-1/2"></div>
                  )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10 ${
                      (visita?.createdAt && visitaActualizada?.id_estado === 3) ? 'bg-[#fcb900]' : 'bg-gray-200'
                      }`}>
                      <CheckCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${(visita?.createdAt && visitaActualizada?.id_estado === 3) ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {(caso?.id_estado === 4) && (
                    <div className={`absolute left-1/2 top-1/2 w-full h-1 -translate-y-1/2 bg-[#fcb900]`}></div>
                    )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-xs sm:text-sm mb-1 ${(visita?.createdAt && visitaActualizada?.id_estado === 3) ? 'text-gray-900' : 'text-gray-500'}`}>
                    Finalizada
                  </p>
                  {visita?.createdAt ? (
                    <p className="text-gray-600 text-xs">
                      {formatDateTime(visita?.createdAt)}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">Pendiente</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  {(caso?.id_estado !== 4) && (
                  <div className="absolute right-1/2 top-1/2 w-full h-1 bg-gray-300 -translate-y-1/2"></div>
                  )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10 ${
                      (caso?.id_estado === 4) ? 'bg-[#fcb900]' : 'bg-gray-200'
                      }`}>
                      <Goal className={`w-5 h-5 sm:w-6 sm:h-6 ${(caso?.id_estado === 4) ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-xs sm:text-sm mb-1 ${(caso?.id_estado === 4) ? 'text-gray-900' : 'text-gray-500'}`}>
                    Caso Cerrado
                  </p>
                  {(caso?.id_estado === 4) ? (
                    <p className="text-gray-600 text-xs">
                      {formatDateTime(caso?.updatedAt)}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">Pendiente</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-600 text-sm mb-1">Objetivo de la Visita</p>
                    <p className="text-blue-900">{visit.comentario}</p>
                  </div>
                </div>
              </div>
              {visit && ultimaReapertura && (
                <div className="bg-orange-50 rounded-xl p-3 sm:p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-orange-600 text-xs sm:text-sm">Motivo de la reapertura</p>
                        {visitasReabiertas.length >= 2 && (
                          <button
                          onClick={() => setShowReopenModal(true)}
                          className="group relative flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg animate-pulse-soft"
                          title="Ver información de reaperturas"
                          >
                            <RefreshCcw className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-xs font-medium">{visitasReabiertas.length}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-orange-900 text-sm sm:text-base">{ultimaReapertura.motivo_reapertura}</p>
                    </div>
                  </div>
                </div>
              )}
              {(confirmationStatus === "finished" || visita) && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-600 text-sm mb-1">Mensaje del supervisor</p>
                        <p className="text-blue-900">{visita?.comentario ?? "Supervisor no asigna comentario a la visita"}</p>
                      </div>
                    </div>
                </div>
              )}
              {(confirmationStatus === "finished" || visita) && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-600 text-sm mb-1">Imagen</p>
                          <button 
                            onClick={() => setShowImageModal(true)}
                            className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            title="Click para ver en grande"
                          >
                            <img src={visita?.url_image} alt="Visita de Emergencia" />
                          </button>
                        </div>
                      </div>
                  </div>
              )}
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
              {(visit.estado === "Finalizada" || confirmationStatus === "finished") && (
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:top-4">
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
      <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse-soft">
                <RefreshCcw className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-gray-900">
              Historial de Reaperturas
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Visita {visit.id_visita} - {visitasReabiertas.length} {visitasReabiertas.length === 1 ? 'reapertura' : 'reaperturas'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-900 text-sm font-medium mb-1">
                    Esta visita requiere atención especial
                  </p>
                  <p className="text-orange-700 text-xs">
                    Las múltiples reaperturas pueden indicar problemas recurrentes que necesitan resolución definitiva.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Historial de Reaperturas
              </h4>
              
              {visitasReabiertas && visitasReabiertas.length > 0 ? (
                <div className="space-y-3">
                  {visitasReabiertas.map((entry, idx) => (
                    <div 
                      key={idx}
                      className="relative bg-white rounded-xl p-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="absolute -left-3 top-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-bold">{visitasReabiertas.length - idx}</span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-900 font-medium text-sm">
                            {(() => {
                              const date = new Date(entry.fecha_reapertura);
                              return isNaN(date.getTime())
                                ? "Fecha inválida"
                                : new Intl.DateTimeFormat("es-GT", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }).format(date);
                            })()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Motivo de Reapertura</p>
                          <p className="text-gray-700 text-sm">{entry.motivo_reapertura}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                  <p className="text-gray-500 text-sm">No hay historial de reaperturas disponible</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowReopenModal(false)}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-4xl p-0 bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Evidencia Fotográfica</DialogTitle>
            <DialogDescription>
              Imagen ampliada de la evidencia fotográfica de la visita {visit.id_visita}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar imagen"
          >
          </button>
          <div className="flex items-center justify-center p-4 sm:p-6 min-h-[300px]">
            <img
              src={visita?.url_image}
              alt="Visita de Emergencia"
              className="
                max-w-full
                max-h-[80vh]
                object-contain
                rounded-lg
              "
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}