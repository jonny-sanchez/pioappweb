import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Ban, CheckCircle } from "lucide-react";
import { format, set } from "date-fns";
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
import { getUserByRol } from "./api/UserApi";
import { User } from "./types/User";
import { PermisoEstadoModel } from "./types/PermisoEstado";
import { createPermisoCaso, getUsersPermisosEstados, quitPermisoCaso } from "./api/UserApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { VwDetallePermisos } from "./types/PermisoEstado";

export interface Visita {
  nombre_tienda: string;
  direccion_tienda: string;
  fecha_hora_visita: string;
  comentario_visita: string;
}

export function CasesPermissionsView() {
    const [selectedUser, setSelectedUser] = useState("");
    const [userToQuit, setUserToQuit] = useState("");
    const [newPermiso, setNewPermiso] = useState<PermisoEstadoModel | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showQuitModal, setQuitModal] = useState(false);
    const [usersPermisos, setUsersPermisos] = useState<VwDetallePermisos[]>([]);

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const data = await getUserByRol("8");
          setUsers(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
      fetchUsersPermisos();
    }, []);

    const fetchUsersPermisos = async () => {
      try {
          const data = await getUsersPermisosEstados();
          setUsersPermisos(data);
      } catch (error) {
          console.error("Error al obtener usuarios con permisos:", error);
      }
    };

    const createPermiso = async () => {
        if (selectedUser) {
            try {
                const data = await createPermisoCaso(selectedUser);
                setNewPermiso(data);
                setShowConfirmModal(true);
                fetchUsersPermisos();
            } catch (err: any) {
                const msg = err?.message ?? 'Error desconocido';
                alert(`Error al crear permiso: ${msg}`);
            }
        } else {
            alert("Selecciona un usuario para delegar permisos.");
        }
    };

    const quitPermiso = async () => {
        if (userToQuit) {
            try {
                await quitPermisoCaso(userToQuit);
                fetchUsersPermisos();
                setQuitModal(false);
                setUserToQuit("");
                alert(`Permiso quitado exitosamente`);
            } catch (err: any) {
                const msg = err?.message ?? 'Error desconocido';
                alert(`Error al quitar permiso: ${msg}`);
            }
        } else {
            alert("Selecciona un usuario para quitar permisos.");
        }
    }

    const handleQuitPermission = async (id_user: string) => {
        setUserToQuit(id_user);
        setQuitModal(true);
    }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-10">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-gray-900 mb-2">Delegación de Permisos</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Delega temporalmente permiso cierre y reapertura de casos a usuarios seleccionados
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pilot" className="text-gray-900 mb-2 block">
                Usuario
              </Label>
              {loading ? (
                <p className="bg-gray-50 border-gray-300 border rounded-md p-2 text-gray-500">
                  Cargando usuarios...
                </p>
              ) : error ? (
                <p className="text-red-500 p-2 border border-red-200 rounded-md">
                  Error: {error}
                </p>
              ) : (
                <Combobox
                  options={users.map((user) => ({
                    id: user.id_users.toString(),
                    name: user.first_name + " " + user.first_last_name,
                  }))}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="Seleccionar usuario"
                  searchPlaceholder="Buscar Usuario"
                  emptyMessage="No se encontró Usuario"
                  className="bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-900"
                />
              )}
            </div>
            <Button
              onClick={createPermiso}
              className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] w-full"
              disabled={
                !selectedUser
              }
            >
              Agregar Permiso
            </Button>
          </div>
        </div>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-gray-900">Usuarios con permiso activo</h2>
                    </div>
                </div>
                {usersPermisos.length > 0 ? (
                    <>
                    <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="text-gray-900 py-4">
                                        Usuario
                                    </TableHead>
                                    <TableHead className="text-gray-900 py-4">
                                        Fecha de permiso
                                    </TableHead>
                                    <TableHead className="text-gray-900 py-4">
                                        Delegado por
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usersPermisos.map((permiso, index) => (
                                    <TableRow
                                    key={index}
                                    className={
                                        index % 2 === 0
                                            ? "bg-white hover:bg-gray-50"
                                            : "bg-gray-50/50 hover:bg-gray-50"
                                    }
                                    >
                                        <TableCell className="text-gray-900 py-4">
                                            {permiso.usuario}
                                        </TableCell>
                                        <TableCell className="text-gray-900 py-4 whitespace-nowrap">
                                            {format(
                                              new Date(permiso.fecha),
                                              "dd/MM/yyyy HH:mm:ss",
                                              { locale: es }
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-600 py-4">
                                            {permiso.creado_por}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex justify-center">
                                              <div className="bg-red-50 rounded-full p-1.5 hover:bg-red-100 cursor-pointer">
                                                <Button
                                                onClick={() => handleQuitPermission(permiso.id_user.toString())}
                                                >
                                                    <Ban className="h-5 w-5 text-red-600" />
                                                </Button>
                                              </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500 py-8">
                    No se encontraron usuarios con permisos activos
                </p>
            )}
        </div>
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-gray-900">
                        Permisos Delegados
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        Permisos delegados exitosamente al usuario {selectedUser}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="flex gap-3 pt-4">
                        <Button
                        onClick={() => setShowConfirmModal(false)}
                        variant="outline"
                        className="flex-1"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <Dialog open={showQuitModal} onOpenChange={setQuitModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-gray-900">
              Quitar Acceso
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              ¿Estás seguro de quitar el acceso de este usuario?
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setQuitModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                    onClick={quitPermiso}
                >
                  Quitar
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}