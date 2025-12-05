import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, FileDown, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Combobox } from "./ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Supervisor } from "../src/types/Supervisor";
import { getAllSupervisors } from "../src/api/SupervisorApi";
import { getVisitaBySupervisor } from "./api/VisitaApi";
import { exportVisitasExcel } from "../src/services/ExportExcel";

export interface Visita {
  nombre_tienda: string;
  direccion_tienda: string;
  fecha_hora_visita: string;
  comentario_visita: string;
}

export function VisitsView() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPilot, setSelectedPilot] = useState("");
  const [showRoutes, setShowRoutes] = useState(false);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const data = await getAllSupervisors();
        setSupervisors(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  const getPilotName = () =>
    supervisors.find((s) => s.codsupervisor === selectedPilot)?.nomsupervisor ||
    "";

  const handleViewRoutes = async () => {
    if (selectedPilot && startDate && endDate) {
      try {
        const fechaInicio = format(startDate, "yyyy-MM-dd");
        const fechaFin = format(endDate, "yyyy-MM-dd");
        const data = await getVisitaBySupervisor(
          selectedPilot,
          fechaInicio,
          fechaFin
        );
        setVisitas(data);
        setShowRoutes(true);
      } catch (error) {
        console.error("Error al obtener visitas:", error);
        setVisitas([]);
        setShowRoutes(true);
      }
    } else {
      console.warn("Selecciona supervisor y rango de fechas");
      setShowRoutes(false);
    }
  };

  const handleExportExcel = async () => {
    const fechaInicioFormateada = startDate
      ? format(startDate, "yyyy-MM-dd")
      : "";
    const fechaFinFormateada = endDate ? format(endDate, "yyyy-MM-dd") : "";
    const logoBase64 = await fetch("/LOGOPINULITOORIGINAL.png")
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      });

    exportVisitasExcel(
      visitas.map((v) => ({
        nombre_tienda: v.nombre_tienda,
        direccion_tienda: v.direccion_tienda,
        fecha_hora_visita: format(
          new Date(v.fecha_hora_visita),
          "dd/MM/yyyy HH:mm:ss"
        ),
        comentario_visita: v.comentario_visita,
      })),
      getPilotName(),
      fechaInicioFormateada,
      fechaFinFormateada,
      logoBase64
    );
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-10">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-gray-900 mb-2">Visitas</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Consulta visitas a tiendas de supervisores
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pilot" className="text-gray-900 mb-2 block">
                Supervisor
              </Label>
              {loading ? (
                <p className="bg-gray-50 border-gray-300 border rounded-md p-2 text-gray-500">
                  Cargando supervisores...
                </p>
              ) : error ? (
                <p className="text-red-500 p-2 border border-red-200 rounded-md">
                  Error: {error}
                </p>
              ) : (
                <Combobox
                  options={supervisors.map((supervisor) => ({
                    id: supervisor.codsupervisor.toString(),
                    name: supervisor.nomsupervisor,
                  }))}
                  value={selectedPilot}
                  onChange={setSelectedPilot}
                  placeholder="Seleccionar supervisor"
                  searchPlaceholder="Buscar Supervisor"
                  emptyMessage="No se encontró Supervisor"
                  className="bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-900"
                />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="start-date"
                  className="text-gray-900 mb-2 block"
                >
                  Fecha de Inicio
                </Label>
                <Popover>
                  <PopoverTrigger asChild className="text-gray-900">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left bg-gray-50 border-gray-300 hover:bg-gray-100 text-sm sm:text-base"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {startDate
                          ? format(startDate, "dd/MM/yyyy", { locale: es })
                          : "Seleccionar fecha"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      selected={startDate}
                      onSelect={setStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="end-date" className="text-gray-900 mb-2 block">
                  Fecha Fin
                </Label>
                <Popover>
                  <PopoverTrigger asChild className="text-gray-900">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left bg-gray-50 border-gray-300 hover:bg-gray-100 text-sm sm:text-base"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {endDate
                          ? format(endDate, "dd/MM/yyyy", { locale: es })
                          : "Seleccionar fecha"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      selected={endDate}
                      onSelect={setEndDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button
              onClick={handleViewRoutes}
              className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] w-full"
              disabled={
                !selectedPilot || !startDate || !endDate || startDate > endDate
              }
            >
              Ver Visitas
            </Button>
          </div>
        </div>
        {showRoutes && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-gray-900">Visitas del Supervisor</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {getPilotName()}
                </p>
              </div>
              <Button
                onClick={handleExportExcel}
                className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] w-full sm:w-auto"
                disabled={visitas.length === 0}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>
            {visitas.length > 0 ? (
              <>
                <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-900 py-4">
                          Tienda
                        </TableHead>
                        <TableHead className="text-gray-900 py-4">
                          Dirección
                        </TableHead>
                        <TableHead className="text-gray-900 py-4">
                          Fecha
                        </TableHead>
                        <TableHead className="text-gray-900 py-4">
                          Comentarios
                        </TableHead>
                        <TableHead className="text-gray-900 py-4 text-center">
                          Realizada
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitas.map((visita, index) => (
                        <TableRow
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-white hover:bg-gray-50"
                              : "bg-gray-50/50 hover:bg-gray-50"
                          }
                        >
                          <TableCell className="text-gray-900 py-4">
                            {visita.nombre_tienda}
                          </TableCell>
                          <TableCell className="text-gray-600 py-4">
                            {visita.direccion_tienda}
                          </TableCell>
                          <TableCell className="text-gray-900 py-4 whitespace-nowrap">
                            {format(
                              new Date(visita.fecha_hora_visita),
                              "dd/MM/yyyy HH:mm:ss",
                              { locale: es }
                            )}
                          </TableCell>
                          <TableCell className="text-gray-600 py-4">
                            {visita.comentario_visita}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex justify-center">
                              <div className="bg-green-50 rounded-full p-1.5">
                                <Check className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="lg:hidden space-y-4">
                  {visitas.map((visita, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">
                            {visita.nombre_tienda}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {visita.direccion_tienda}
                          </p>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          <div
                            className="bg-green-50 rounded-full p-2"
                            title="Completada"
                          >
                            <Check className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm min-w-[80px]">
                            Fecha:
                          </span>
                          <span className="text-gray-900 text-sm">
                            {format(
                              new Date(visita.fecha_hora_visita),
                              "dd/MM/yyyy HH:mm:ss",
                              { locale: es }
                            )}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm min-w-[80px]">
                            Comentarios:
                          </span>
                          <span className="text-gray-600 text-sm flex-1">
                            {visita.comentario_visita}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No se encontraron visitas para los criterios seleccionados.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}