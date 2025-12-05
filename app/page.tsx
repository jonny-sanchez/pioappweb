"use client";
import { useState } from "react";
import { Header } from "./src/Header";
import { HomeView } from "./src/HomeView";
import { VisitsView } from "./src/VisitsView";
import { DeliveryView } from "./src/DeliveryView";
import { EmergencyVisitsView } from "./src/EmergencyVisitsView";
import { EmergencyVisitDetail } from "./src/EmergencyVisitDetail";
import { LoginView } from "./src/LoginView";
import { Home, LogOut, X } from "lucide-react";
import { VwDetalleVisitaEmergencia } from "./src/types/VisitaEmergencia";

type View =
  | "home"
  | "visitas"
  | "agregar"
  | "emergencias"
  | "emergencia-detalle";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmergencyVisit, setSelectedEmergencyVisit] =
    useState<VwDetalleVisitaEmergencia | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView("home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("home");
    setIsMobileMenuOpen(false);
    localStorage.clear();
  };

  const handleSelectEmergencyVisit = (
    visit: VwDetalleVisitaEmergencia
  ) => {
    setSelectedEmergencyVisit(visit);
    setCurrentView("emergencia-detalle");
  };

  const handleBackFromDetail = () => {
    setSelectedEmergencyVisit(null);
    setCurrentView("emergencias");
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex pt-[60px]">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 lg:mr-64">
          <div className="max-w-6xl mx-auto">
            {currentView === "home" && (
              <HomeView onNavigate={setCurrentView} />
            )}
            {currentView === "visitas" && <VisitsView />}
            {currentView === "agregar" && <DeliveryView />}
            {currentView === "emergencias" && (
              <EmergencyVisitsView
                onNavigate={setCurrentView}
                onSelectVisit={handleSelectEmergencyVisit}
              />
            )}
            {currentView === "emergencia-detalle" && (
              <EmergencyVisitDetail
                visit={selectedEmergencyVisit!}
                onBack={handleBackFromDetail}
              />
            )}
          </div>
        </div>
        <aside className="hidden lg:block w-64 bg-white shadow-2xl border-l border-gray-200 fixed top-[110px] right-0 bottom-0 h-[calc(100vh-80px)]">
          <div className="p-6 flex flex-col h-full">
            <div className="mb-8 pb-4 border-b border-gray-200">
              <h2 className="text-gray-900">Menú</h2>
            </div>
            <nav className="space-y-3">
              <button
                onClick={() => setCurrentView("home")}
                className="w-full text-left px-5 py-4 rounded-xl transition-all text-gray-700 hover:bg-gray-100 flex items-center group"
              >
                <Home
                  size={20}
                  className="mr-3 text-gray-600 group-hover:text-[#fcb900]"
                />
                <span>Inicio</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-5 py-4 rounded-xl transition-all text-red-600 hover:bg-red-50 flex items-center group"
              >
                <LogOut size={20} className="mr-3" />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </aside>
        {isMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-[80px]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed top-[80px] right-0 bottom-0 w-64 bg-white shadow-2xl z-50">
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-gray-900">Menú</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
                <nav className="space-y-3">
                  <button
                    onClick={() => {
                      setCurrentView("home");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-4 rounded-xl transition-all text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Home size={20} className="mr-3" />
                    <span>Inicio</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-4 rounded-xl transition-all text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Cerrar Sesión</span>
                  </button>
                </nav>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}