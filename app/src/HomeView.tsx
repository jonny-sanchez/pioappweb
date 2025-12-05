import { Calendar, CalendarClock, Package } from "lucide-react";

interface HomeViewProps {
  onNavigate: (view: "visitas" | "agregar" | "emergencias") => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-gray-900 mb-3">Bienvenido al Sistema</h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Selecciona una opción para comenzar
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <button
            onClick={() => onNavigate("visitas")}
            className="group bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
              </div>
              <h2 className="text-gray-900 mb-2 sm:mb-3">
                Historial de Visitas
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Consulta y gestiona las visitas de supervisores
              </p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("agregar")}
            className="group bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
              </div>
              <h2 className="text-gray-900 mb-2 sm:mb-3">
                Agregar Visita
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Asigna supervisores nuevas visitas de emergencia
              </p>
            </div>
          </button>
        </div>
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={() => onNavigate("emergencias")}
            className="group bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-1/2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <CalendarClock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
              </div>
              <h2 className="text-gray-900 mb-2 sm:mb-3">
                Control de Visitas de Emergencia
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Consulta y gestiona las visitas de emergencia activas
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}