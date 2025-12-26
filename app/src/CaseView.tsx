import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { CheckCircle, CircleX } from "lucide-react";
import { TiendaModulo } from "../src/types/TiendaModulo";
import { TipoSolicitud } from "./types/TipoSolicitud";
import { Impacto } from "./types/Impacto";
import { Urgencia } from "./types/Urgencia";
import { Categoria } from "./types/Categoria";
import { Subcategoria } from "./types/Subcategoria";
import {
    getAllTiposSolicitud,
    getAllImpactos,
    getAllUrgencias,
    getAllCategorias,
    getSubcategoriaByCategoria,
    createCaso
} from '../src/api/CasoApi';
import { getAllTiendas } from "../src/api/TiendaModuloApi";
import { Combobox } from "./ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CasoModel } from "./types/Caso";

export function CaseView() {
    const [stores, setStores] = useState<TiendaModulo[]>([]);
    const [tiposSolicitud, setTiposSolicitud] = useState<TipoSolicitud[]>([]);
    const [impactos, setImpactos] = useState<Impacto[]>([]);
    const [urgencias, setUrgencias] = useState<Urgencia[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [selectedTipoSolicitud, setSelectedTipoSolicitud] = useState("");
    const [selectedImpacto, setSelectedImpacto] = useState("");
    const [selectedUrgencia, setSelectedUrgencia] = useState("");
    const [selectedCategoria, setSelectedCategoria] = useState("");
    const [selectedSubcategoria, setSelectedSubcategoria] = useState("");
    const [casoCreado, setCasoCreado] = useState<CasoModel | null>(null);
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStore, setSelectedStore] = useState<TiendaModulo | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    //OBTENER TIENDAS
    const fetchStores = async () => {
        try {
            const data = await getAllTiendas('0');
            setStores(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    //OBTENER TIPOS DE SOLICITUD
    const fecthTiposSolicitud = async () => {
        try {
            const data = await getAllTiposSolicitud();
            setTiposSolicitud(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    //OBTENER IMPACTO
    const fecthImpacto = async () => {
        try {
            const data = await getAllImpactos();
            setImpactos(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    //OBTENER URGENCIA
    const fecthUrgencia = async () => {
        try {
            const data = await getAllUrgencias();
            setUrgencias(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    //OBTENER CATEGORIAS
    const fecthCategoria = async () => {
        try {
            const data = await getAllCategorias();
            setCategorias(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    //OBTENER SUBCATEGORIAS
    const fecthSubcategoria = async () => {
        try {
            const data = await getSubcategoriaByCategoria(Number(selectedCategoria));
            setSubcategorias(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStores();
        fecthTiposSolicitud();
        fecthImpacto();
        fecthUrgencia();
        fecthCategoria();
    }, []);

    useEffect(() => {
        fecthSubcategoria();
    }, [selectedCategoria])

    const handleReset = () => {
        setShowSuccess(false);
        setShowError(false);
        setSelectedStore(null);
        setSelectedTipoSolicitud("");
        setSelectedImpacto("");
        setSelectedUrgencia("");
        setSelectedCategoria("");
        setSelectedSubcategoria("");
        setComments("");
    };

    const createNewCaso = async () => {
        const fecha = new Date();
        if(selectedStore && selectedTipoSolicitud && selectedImpacto && selectedUrgencia && selectedCategoria && selectedSubcategoria) {
            const caso = await createCaso({
                id_tienda: selectedStore.codigo_tienda,
                tienda_nombre: selectedStore.nombre_tienda,
                id_empresa: selectedStore.codigo_empresa,
                division: Number(selectedStore.division),
                id_tipo_solicitud: Number(selectedTipoSolicitud),
                id_estado: 1,
                id_impacto: Number(selectedImpacto),
                id_urgencia: Number(selectedUrgencia),
                id_categoria: Number(selectedCategoria),
                id_subcategoria: Number(selectedSubcategoria),
                mensaje: comments,
            })
            if (caso.message) {
                    setErrorMessage(caso.message);
                    setShowError(true);
                    return
                  }
                  else{
                    setCasoCreado(caso.nuevoCaso);
                    setShowSuccess(true);
                  }
        } else {
            console.warn("Hacen falta parámetros para crear un nuevo caso");
        }
    }

    const impactoSeleccionado = impactos.find(
        (i) => i.id_impacto.toString() === selectedImpacto
    );

    const urgenciaSeleccionada = urgencias.find(
        (u) => u.id_urgencia.toString() === selectedUrgencia
    );

    const tipoSolicitudSeleccionada = tiposSolicitud.find(
    (t) => t.id_tipo_solicitud.toString() === selectedTipoSolicitud
    );

    const categoriaSeleccionada = categorias.find(
        (c) => c.id_categoria.toString() === selectedCategoria
    );

    const subcategoriaSeleccionada = subcategorias.find(
        (s) => s.id_subcategoria.toString() === selectedSubcategoria
    );

  return (
    <div className="py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid transition-all duration-700 ease-in-out grid-cols-1 place-items-center">
          <div className="w-full max-w-[500px] transition-all duration-700 ease-in-out">
            <div className="relative">
              <div
                className={`absolute top-0 left-0 w-full bg-white rounded-2xl  border border-gray-200 pr-8 pl-8 pb-8 pt-2 transition-all duration-700 ease-in-out ${
                  showSuccess || showError ? "-translate-x-[500px] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
                }`}
              >
                <div className="text-center mb-8">
                  <h2 className="text-gray-900 mb-2">Agregar un nuevo caso</h2>
                  <p className="text-gray-600">Agrega un nuevo caso para el área administrativa y operativa</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="pilot" className="text-gray-900 mb-2 block">Tienda</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Tiendas...</p>
                    ) : ( 
                      <Combobox
                        options={stores.map((store) => ({
                          id: store.id_tienda.toString(),
                          name: store.nombre_tienda + " | DIVISIÓN " + store.division,
                          empresa: store.codigo_empresa,
                          lat: store.latitud,
                          lng: store.altitud
                        }))}
                        value={selectedStore ? selectedStore.id_tienda.toString() : ""}
                        onChange={(id) => {
                          const store = stores.find((s) => s.id_tienda.toString() === id);
                          if (store) {
                            setSelectedStore({
                              id_tienda: store.id_tienda,
                              nombre_tienda: store.nombre_tienda,
                              direccion_tienda: store.direccion_tienda,
                              codigo_empresa: store.codigo_empresa,
                              latitud: store.latitud ?? 0,
                              altitud: store.altitud ?? 0,
                              id_departamento: store.id_departamento,
                              nombre_empresa: store.nombre_empresa,
                              codigo_tienda: store.codigo_tienda,
                              division: store.division,
                            });
                          }
                        }}
                        placeholder="Seleccionar tienda"
                        searchPlaceholder="Buscar Tienda"
                        emptyMessage="No se encontró tienda"
                        className="text-gray-900"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="tipo_solicitud" className="text-gray-900 mb-2 block">Tipo de Solicitud</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando tipos de solicitud...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                        <Select value={selectedTipoSolicitud} onValueChange={setSelectedTipoSolicitud}>
                        <SelectTrigger id="tipo_solicitud" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Tipo de Solicitud" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposSolicitud.map((im) => (
                            <SelectItem 
                            key={im.id_tipo_solicitud}
                            value={im.id_tipo_solicitud.toString()}
                            className="cursor-pointer">
                              {im.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="impacto" className="text-gray-900 mb-2 block">Impacto</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Impactos...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select value={selectedImpacto} onValueChange={setSelectedImpacto}>
                        <SelectTrigger id="impacto" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Impacto" />
                        </SelectTrigger>
                        <SelectContent>
                          {impactos.map((im) => (
                            <SelectItem 
                            key={im.id_impacto}
                            value={im.id_impacto.toString()}
                            className="cursor-pointer">
                              {im.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="urgencia" className="text-gray-900 mb-2 block">Urgencia</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Urgencias...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select value={selectedUrgencia} onValueChange={setSelectedUrgencia}>
                        <SelectTrigger id="urgencia" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Urgencia" />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencias.map((ur) => (
                            <SelectItem 
                            key={ur.id_urgencia}
                            value={ur.id_urgencia.toString()}
                            className="cursor-pointer">
                              {ur.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="categoria" className="text-gray-900 mb-2 block">Categoria</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Categorias...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                        <SelectTrigger id="categoria" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((ur) => (
                            <SelectItem 
                            key={ur.id_categoria}
                            value={ur.id_categoria.toString()}
                            className="cursor-pointer">
                              {ur.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="subcategoria" className="text-gray-900 mb-2 block">Subcategoria</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Subcategorias...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select value={selectedSubcategoria} onValueChange={setSelectedSubcategoria}>
                        <SelectTrigger id="subcategoria" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategorias.map((sub) => (
                            <SelectItem 
                            key={sub.id_subcategoria}
                            value={sub.id_subcategoria.toString()}
                            className="cursor-pointer"
                            disabled={!selectedCategoria}>
                              {sub.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="comments" className="text-gray-900 mb-2 block">Mensaje</Label>
                    <textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Describe el objetivo de la visita..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fcb900] focus:border-transparent resize-none text-gray-900"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={createNewCaso}
                    className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] w-full mt-2"
                    disabled={!selectedStore || !selectedTipoSolicitud || !selectedImpacto || !selectedUrgencia || !selectedCategoria || !selectedSubcategoria}
                  >
                    Agregar Caso
                  </Button>
                </div>
              </div>
              
              {casoCreado && (
                <div
                  className={`absolute top-0 left-0 w-full bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-700 ease-in-out ${
                  showSuccess ? "translate-x-0 opacity-100" : "translate-x-[500px] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2 text-center">¡Caso Creado!</h2>
                    <p className="text-gray-600 text-center mb-2">El caso se creó correctamente</p>
                    <div className="w-full space-y-4 mb-8">
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Tienda</p>
                        <p className="text-gray-800">{selectedStore?.nombre_tienda}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Empresa</p>
                        <p className="text-gray-800">{selectedStore?.nombre_empresa}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">División</p>
                        <p className="text-gray-800">{selectedStore?.division}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Impacto</p>
                        <p className="text-gray-800">{impactoSeleccionado?.nombre}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Urgencia</p>
                        <p className="text-gray-800">{urgenciaSeleccionada?.nombre}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Categoría</p>
                        <p className="text-gray-800">{categoriaSeleccionada?.nombre}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Subcategoría</p>
                        <p className="text-gray-800">{subcategoriaSeleccionada?.nombre}</p>
                      </div>
                      {comments && (
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">Mensaje</p>
                          <p className="text-gray-800">{casoCreado.mensaje}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleReset}
                      className="bg-gray-900 text-white hover:bg-gray-800 w-full"
                    >
                      Nuevo Caso
                    </Button>
                  </div>
              </div>
              )}
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
                    <h2 className="text-gray-900 mb-2 text-center">Error al Crear Caso!</h2>
                    <p className="text-gray-600 text-center mb-2">La creación del caso no se pudo realizar correctamente</p>
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
                      Nuevo Caso
                    </Button>
                  </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}