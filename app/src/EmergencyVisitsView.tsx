import { useEffect, useState } from "react";
import { AlertCircle, MapPin, User, ChevronRight, Calendar, Search, FileDown } from "lucide-react";
import { Input } from "./ui/input";
import { getVisitasEmergencia } from "./api/VisitaApi";
import { VwDetalleVisitaEmergencia } from "./types/VisitaEmergencia";
import { exportVisitasEmergenciaExcel } from "./services/ExportEmergencyExcel";
import { Button } from "./ui/button";

interface EmergencyVisitsViewProps {
  onNavigate: (view: "emergencias" | "emergencia-detalle") => void;
  onSelectVisit: (visit: VwDetalleVisitaEmergencia) => void;
}

export function EmergencyVisitsView({ onNavigate, onSelectVisit } : EmergencyVisitsViewProps) {
  const [filter, setFilter] = useState<"all" | "Asignada" | "En Proceso" | "Finalizada" | "Atrasada">("Asignada");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitas, setVisitas] = useState<VwDetalleVisitaEmergencia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const division = localStorage.getItem("division");

  const validaFechas = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return d < today;
  };


  useEffect(() => {
    const fetchEmergencyVisits = async () => {
            try {
              const data = await getVisitasEmergencia(Number(division));
              setVisitas(data);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setLoading(false);
            }
          };
    fetchEmergencyVisits();
  }, [division])

  const filteredVisits = visitas.filter(visit => {
    let matchedStatus = true;

    if(filter === "Atrasada") {
      if(visit.estado === "Finalizada" || !visit.fecha_programacion) {
        matchedStatus = false;
      } else {
        matchedStatus = validaFechas(new Date(visit.fecha_programacion));
      }
    } else if(filter !== "all") {
      matchedStatus = visit.estado === filter;
    }
    
    const matchesSearch = searchQuery === "" || 
      visit.nombre_user_asignado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.id_visita?.toString().includes(searchQuery.toLowerCase()) ||
      visit.tienda_nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchedStatus && matchesSearch;
  });

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
      case "Asignada":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Confirmada":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Finalizada":
        return "bg-green-50 text-green-700 border-green-200";
      case "Atrasada":
        return "bg-red-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleExportExcel = async () => {
    const logoBase64 = await fetch("/LOGOPINULITOORIGINAL.png")
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      });

    exportVisitasEmergenciaExcel(
      filteredVisits,
      division ?? "N/A",
      filter,
      logoBase64 // el mismo base64 que usas en Casos
    );
  };


  const pendingCount = visitas.filter(v => v.estado === "Asignada").length;
  const inProgressCount = visitas.filter(v => v.estado === "En Proceso").length;
  const finishedCount = visitas.filter(v => v.estado === "Finalizada").length;
  const overdueCount = visitas.filter(v => {
    if (v.estado === "Finalizada" || !v.fecha_programacion) return false;
    return validaFechas(new Date(v.fecha_programacion));
  }).length;


  return (
    <div className="max-w-6xl mx-auto p-10">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-gray-900">Tareas</h1>
            <p className="text-gray-600">Gestiona y monitorea las tareas urgentes</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total de Tareas</p>
            <p className="text-gray-900 text-2xl">{visitas.length}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-blue-600 text-sm mb-1">Asignadas</p>
            <p className="text-blue-700 text-2xl">{pendingCount}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <p className="text-yellow-600 text-sm mb-1">En Proceso</p>
            <p className="text-yellow-700 text-2xl">{inProgressCount}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-green-600 text-sm mb-1">Finalizadas</p>
            <p className="text-green-700 text-2xl">{finishedCount}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-red-600 text-sm mb-1">Atrasadas</p>
            <p className="text-red-700 text-2xl">{overdueCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-6">
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2 rounded-lg transition-all ${
                filter === "all"
                  ? "bg-[#fcb900] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todas ({visitas.length})
            </button>
            <button
              onClick={() => setFilter("Asignada")}
              className={`px-5 py-2 rounded-lg transition-all ${
                filter === "Asignada"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Asignadas ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("En Proceso")}
              className={`px-5 py-2 rounded-lg transition-all ${
                filter === "En Proceso"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En Proceso ({inProgressCount})
            </button>
            <button
              onClick={() => setFilter("Finalizada")}
              className={`px-5 py-2 rounded-lg transition-all ${
                filter === "Finalizada"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Finalizadas ({finishedCount})
            </button>
            <button
              onClick={() => setFilter("Atrasada")}
              className={`px-5 py-2 rounded-lg transition-all ${
                filter === "Atrasada"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Atrasadas ({overdueCount})
            </button>
          </div>
          <Button
            onClick={handleExportExcel}
            className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] whitespace-nowrap"
            disabled={filteredVisits.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-00 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por supervisor, ID o tienda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-gray-300 focus:border-[#fcb900] focus:ring-[#fcb900] text-gray-900"
          />
        </div>
        {searchQuery && (
          <p className="text-gray-600 text-sm mt-2">
            Se encontraron <span className="text-gray-900">{filteredVisits.length}</span> resultado
            {filteredVisits.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {filteredVisits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay visitas de emergencia con este filtro</p>
          </div>
        ) : (
          filteredVisits.map((visitas) => (
            <button
              key={visitas.id_visita}
              onClick={() => onSelectVisit(visitas)}
              className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-900">{visitas.id_visita}</span>
                    <span className={`px-3 py-1 rounded-lg border text-sm ${getStatusColor(visitas.estado)}`}>
                      {(visitas.estado)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Supervisor</p>
                        <p className="text-gray-900">{visitas.nombre_user_asignado}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Tienda</p>
                        <p className="text-gray-900">{visitas.tienda_nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Tipo de Visita</p>
                        <p className="text-gray-900">{visitas.tipo_visita}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Fecha Asignada</p>
                        <p className="text-gray-900 text-sm">{formatDateTime(visitas.fecha_programacion)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-500 text-sm mb-1">Comentarios</p>
                    <p className="text-gray-700">{visitas.comentario}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mt-2" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}