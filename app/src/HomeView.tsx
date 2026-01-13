
import { Calendar, CalendarClock, Package, ClipboardList, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "./api/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "@radix-ui/react-label";
import { updateUser } from "./api/UserApi";

interface HomeViewProps {
  onNavigate: (view: "visitas" | "agregar" | "emergencias" | "caso" | "casos") => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const { user } = useAuth();
  const idRol = localStorage.getItem("rol");
  const [actualizaInfo, setActualizaInfo] = useState<Boolean>(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>("");

  const PUBLIC_EMAIL_DOMAINS = [
    "gmail.com",
    "outlook.com",
    "outlook.es",
    "hotmail.com",
    "yahoo.com",
    "live.com",
    "icloud.com",
    "msn.com"
  ];


  useEffect(() => {
    if (localStorage.getItem("email") === "0") {
      setActualizaInfo(false);
      setShowUpdateModal(true);
    }
  }, []);

  const isCorporateEmail = (email: string) => {
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!basicEmailRegex.test(email)) return false;

  const domain = email.split("@")[1].toLowerCase();
  return !PUBLIC_EMAIL_DOMAINS.includes(domain);
};


  const canUpdate = useMemo(() => isCorporateEmail(email), [email]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (!value) {
      setEmailError("El correo es requerido");
    } else if (!isCorporateEmail(value)) {
      setEmailError("No se permiten correos personales (Gmail, Outlook, Yahoo, etc.)");
    } else {
      setEmailError("");
    }
  };

  const handleActualizar = async () => {
    try {
      if (!isCorporateEmail(email)) {
        setEmailError("Debes ingresar un correo corporativo");
        return;
      }

      await updateUser(email);
      localStorage.setItem("email", "1");

      setActualizaInfo(true);
      setShowUpdateModal(false);
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error.message);

      // Puedes mostrar el error donde prefieras
      alert(error.message || "Error al actualizar el usuario");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-gray-900 mb-3">Bienvenido al Sistema</h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Selecciona una opción para comenzar
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {(idRol === "7" || idRol === "9") && (
          <button
            onClick={() => onNavigate("visitas")}
            className="group bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-[calc(50%-1rem)]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
              </div>
              <h2 className="text-gray-900 mb-2 sm:mb-3">Historial de Visitas</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Consulta y gestiona las visitas de supervisores
              </p>
            </div>
          </button>
          )}
          {(idRol === "7" || idRol === "9") && (
            <button
              onClick={() => onNavigate("emergencias")}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-[calc(50%-1rem)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <CalendarClock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
                </div>
                <h2 className="text-gray-900 mb-2 sm:mb-3">
                  Control de Tareas
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Consulta y gestiona las tareas activas
                </p>
              </div>
            </button>
          )}
          {(
            <button
              onClick={() => onNavigate("casos")}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-[calc(50%-1rem)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
                </div>
                <h2 className="text-gray-900 mb-2 sm:mb-3">Lista de Casos</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Gestiona y administra todos los casos creados
                </p>
              </div>
            </button>
          )}
          {idRol === "8" && (
            <button
              onClick={() => onNavigate("caso")}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-[calc(50%-1rem)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
                </div>
                <h2 className="text-gray-900 mb-2 sm:mb-3">Agregar Caso</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Crea casos sobre incidencias e inconvenientes operativas
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
      {!actualizaInfo && (
        <Dialog
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}>
          <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="sm:max-w-md bg-white">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br bg-[#fcb900] rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-gray-900">
                Actualiza tu información
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                Por favor ingresa tu correo corporativo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <Label htmlFor="correo" className="text-gray-900 mb-2 block">
                  Correo
                </Label>
                <input
                  id="correo"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Escribe tu correo electrónico..."
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "correo-error" : undefined}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    emailError ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#fcb900] focus:border-transparent resize-none text-gray-900`}
                />
                {emailError && (
                  <p id="correo-error" className="mt-2 text-sm text-red-600">
                    {emailError}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canUpdate}
                  onClick={handleActualizar}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}