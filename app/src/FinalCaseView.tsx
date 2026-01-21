import {
  User,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Calendar,
  MessageSquare,
  Camera,
  CircleX,
  CheckCircle,
} from "lucide-react";
import { VwDetalleCaso } from "./types/Caso";
import { CasoModel } from "./types/Caso";
import { PermisoEstadoModel } from "./types/PermisoEstado";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import Image from "next/image";
import { cierreReaperturaCaso, permisoEstado } from "./api/CasoApi";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { getVisitasEmergenciaByCaso, getVisitaByVisitaEmergencia } from "./api/VisitaApi";
import { VwDetalleVisitaEmergencia } from "./types/VisitaEmergencia";
import { Visita } from "./types/Visita";
import { MapView } from "./MapView";
import logo from "../../assets/img/image-default.png"

interface FinalCaseDetailProps {
  caso: VwDetalleCaso;
  onBack: () => void;
}

export function FinalCaseDetail({ caso, onBack }: FinalCaseDetailProps) {
  const [updatedCaso, setUpdatedCaso] = useState<CasoModel | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [visitaEmergencia, setVisitaEmergencia] = useState<VwDetalleVisitaEmergencia | null>(null)
  const [visita, setVisita] = useState<Visita | null>(null);
  const [permiso, setPermiso] = useState<PermisoEstadoModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [timeEstimate, setTimeEstimate] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [lastGpsLat, setLastGpsLat] = useState<number | null>(
    visitaEmergencia?.last_gps_latitude !== null ? Number(visitaEmergencia?.last_gps_latitude) : null
  );
  const [lastGpsLng, setLastGpsLng] = useState<number | null>(
    visitaEmergencia?.last_gps_longitude !== null ? Number(visitaEmergencia?.last_gps_longitude) : null
  );

    const fetchVisitaEmergencia = async () => {
        try {
            const data = await getVisitasEmergenciaByCaso(caso.id_caso);
            setVisitaEmergencia(data);
            setLastGpsLat(Number(data?.last_gps_latitude));
            setLastGpsLng(Number(data?.last_gps_longitude));

            const p = await permisoEstado();
            setPermiso(p);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        }
    }

    const fetchVisita = async () => {
        if(visitaEmergencia) {
            try {
                const data = await getVisitaByVisitaEmergencia(visitaEmergencia.id_visita)
                setVisita(data);
            } catch (err: any) {
                if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                    localStorage.clear();
                    setIsAuthenticated(false);
                    return;
                }
                setError((err as Error).message);
            }
        }
    }

    const handleReset = () => {
        setShowSuccess(false);
        setShowError(false);
    };
    
    useEffect(() => {
        fetchVisitaEmergencia()
    }, [])

    useEffect(() => {
      fetchVisita();
    }, [visitaEmergencia])

    const lastVisitLocation =
      lastGpsLat !== null && lastGpsLng !== null
        ? {
          lat: lastGpsLat,
          lng: lastGpsLng,
          name: "Última visita",
          }
    : null;

    const cierreCaso = async () => {
      const updatedCaso = await cierreReaperturaCaso(caso.id_caso, "4", comments);

      if (!updatedCaso.caso) {
          setErrorMessage(updatedCaso.message || "Error al cerrar el caso");
          setShowError(true);
          return;
      }

      setUpdatedCaso(updatedCaso.caso);
      setShowSuccess(true);
      alert("El cierre del caso se realizó correctamente")
    }

    const reaperturaCaso = async () => {
      const updatedCaso = await cierreReaperturaCaso(caso.id_caso, "2", comments);

      if (!updatedCaso.caso) {
          setErrorMessage(updatedCaso.message || "Error al actualizar el caso");
          setShowError(true);
          return;
      }

      setUpdatedCaso(updatedCaso.caso);
      setShowSuccess(true);
      alert("La reapertura del caso se realizó correctamente")
    }

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "";

        const date = new Date(dateString);

        return date.toLocaleString("es-GT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-50 text-red-700 border-red-200";
      case "in-progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Finalizado":
        return "bg-green-50 text-green-700 border-green-200";
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

  const handleReopen = () => {
    setShowReopenModal(true);
  };

  const handleClose = () => {
    setShowCloseModal(true);
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
                <h1 className="text-gray-900">Caso</h1>
                <p className="text-gray-600">{caso.correlativo}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg border ${getStatusColor(caso.estado || "")}`}>
              {getStatusText(caso.estado || "")}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="grid transition-all duration-700 ease-in-out grid-cols-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Detalles de la Visita</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Supervisor</p>
                    <p className="text-gray-900">{visitaEmergencia?.nombre_user_asignado}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Tienda</p>
                    <p className="text-gray-900">{visita?.tienda_nombre}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-600 text-sm mb-1">Fecha y Hora de Finalización</p>
                    <p className="text-yellow-900">{formatDateTime(visita?.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-600 text-sm mb-1">Objetivo de la Visita</p>
                    <p className="text-blue-900">{visitaEmergencia?.comentario}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-600 text-sm mb-1">Mensaje del supervisor</p>
                    <p className="text-blue-900">{visita?.comentario ?? "Supervisor no asigna comentario a la visita"}</p>
                  </div>
                </div>
              </div>
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
              <div className="bg-gray-100 rounded-xl p-3 border border-gray-300">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-gray-600 mr-2" />
                  <p className="text-gray-700">Visita Finalizada</p>
                </div>
              </div>
              {permiso && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                <Button
                onClick={() => handleClose()}
                disabled={caso.estado === "Cerrado"}
                className="border border-[#33CCFF] flex-1 bg-[#33CCFF] hover:text-[#33CCFF] text-gray-900 hover:bg-white h-10 sm:h-12 text-sm sm:text-base"
                >
                  Cerrar Caso
                </Button>
                <Button
                onClick={() => handleReopen()}
                className="flex-1 bg-[#fcb900] text-gray-900 border border-[#fcb900] hover:bg-gray-100 hover:text-[#fcb900] h-10 sm:h-12 text-sm sm:text-base"
                >
                <CheckCircle className="w-4 h-4 mr-2" />
                  Reabrir Caso
                </Button>
              </div>   
              )}         
            </div>
              {showError && (
                <div
                  className={`absolute top-0 left-0 w-full bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-700 ease-in-out ${
                  showError ? "translate-x-0 opacity-100" : "translate-x-[500px] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-3">
                      <CircleX className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2 text-center">Error al Reabrir Caso!</h2>
                    <p className="text-gray-600 text-center mb-2">La reapertura del caso no se pudo realizar correctamente</p>
                    <div className="w-full space-y-4 mb-8">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p className="text-gray-500 text-sm mb-1">Detalles</p>
                        <p className="text-gray-800">{errorMessage}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleReset}
                      className="bg-gray-900 text-white hover:bg-gray-800 w-full"
                    >
                      Regresar
                    </Button>
                  </div>
              </div>
              )}
          </div>
        </div>
        {visitaEmergencia && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:top-4">
            <h2 className="text-gray-900 mb-4 text-center">Ubicaciones</h2>
              <div className="h-[600px]">
                <MapView
                  lastVisit={lastVisitLocation}
                  newVisit={{
                    lat: Number(visitaEmergencia?.new_gps_latitude),
                    lng: Number(visitaEmergencia?.new_gps_longitude),
                    name: "Destino",
                  }}
                  onTimeCalculated={(eta) => setTimeEstimate(eta)}
                />
              </div>
          </div>
        )}
      </div>
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-gray-900">
              Cerrar Caso
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              ¿Estás seguro de Cerrar este caso?
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowCloseModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    cierreCaso();
                    onBack();
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-gray-900">
              Reabrir Caso
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              ¿Estás seguro de reabrir este caso?
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-gray-500 text-xs mb-1">Motivo de reapertura</p>
                  <textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Describe el motivo por el que se reabrirá el caso..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fcb900] focus:border-transparent resize-none text-gray-900"
                    rows={3}
                  />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowReopenModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    reaperturaCaso();
                    onBack();
                  }}
                >
                  Reabrir
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
              Imagen ampliada de la evidencia fotográfica de la visita {visita?.id_visita}
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
  )
}