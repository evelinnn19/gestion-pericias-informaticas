import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  ShieldCheck,
  BarChart2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { apiClient } from '@/api/client';
import ListadoOficiosReadOnly from '@/components/ui/ListadoOficiosReadOnly';

export default function UsuariosView() {
  // ── Búsqueda y filtro ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState('');

  // ── Datos de usuarios ──────────────────────────────────────────────────────
  const [usersData, setUsersData] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  // ── Opciones dinámicas de roles ────────────────────────────────────────────
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState(null);

  // ── Sección colapsable de oficios ──────────────────────────────────────────
  const [showOficiosList, setShowOficiosList] = useState(false);

  // ── Carga inicial de roles (para el select) ────────────────────────────────
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      setErrorRoles(null);
      try {
        const { data } = await apiClient.get('/picklists/roles');
        setRoles(data || []);
      } catch (err) {
        console.error('[UsuariosView] Error cargando roles:', err);
        setErrorRoles('No se pudieron cargar los roles.');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // ── Carga inicial de usuarios con su rol ──────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        // El endpoint /api/usuarios devuelve usuarios con idrol.
        // También traemos roles para hacer el JOIN client-side si la API no los incluye.
        const { data } = await apiClient.get('/usuarios');
        setUsersData(data || []);
      } catch (err) {
        console.error('[UsuariosView] Error cargando usuarios:', err);
        setErrorUsers('No se pudieron cargar los usuarios.');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // ── Mapa idrol → descripcion para mostrar en la tabla ─────────────────────
  const rolMap = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      map[r.idrol] = r.descripcion;
    });
    return map;
  }, [roles]);

  // ── Filtrado reactivo client-side ──────────────────────────────────────────
  const usuariosFiltrados = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return usersData.filter((u) => {
      // Filtro por texto: nombre, apellido, DNI, correo
      const matchTexto =
        !term ||
        u.nombre?.toLowerCase().includes(term) ||
        u.apellido?.toLowerCase().includes(term) ||
        u.dni?.toLowerCase().includes(term) ||
        u.correo?.toLowerCase().includes(term);

      // Filtro por rol (compara por idrol)
      const matchRol = !rolSeleccionado || String(u.idrol) === rolSeleccionado;

      return matchTexto && matchRol;
    });
  }, [usersData, searchQuery, rolSeleccionado]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)] gap-8">

      {/* ── Section: Gestión de Usuarios ── */}
      <section>
        {/* Header: título + botones de acción */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1f3e97]">
            Gestión de Usuarios y Roles
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Auditoría de usuarios — solo UI, sin funcionalidad */}
            <Button
              id="btn-auditoria-usuarios"
              className="inline-flex items-center gap-2 bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-10 px-5 text-sm font-semibold shadow-md transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Auditoría de Usuarios
            </Button>

            {/* Estadísticas */}
            <Button
              id="btn-estadisticas-admin"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 text-sm font-semibold shadow-md transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Estadísticas
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda + filtro de rol */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Buscador de texto */}
          <div className="relative flex-1 max-w-3xl">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              id="usuarios-busqueda"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Nombre, Apellido, DNI o Correo..."
              className="pl-10 bg-gray-50 border-gray-200 rounded-full h-12 text-base text-gray-700 w-full"
            />
          </div>

          {/* Filtro dinámico de roles */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Label className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              Filtrar por Rol:
            </Label>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </div>
            ) : errorRoles ? (
              <span className="text-xs text-red-500">{errorRoles}</span>
            ) : (
              <Select
                value={rolSeleccionado}
                onValueChange={(val) => setRolSeleccionado(val === 'todos' ? '' : val)}
              >
                <SelectTrigger
                  id="usuarios-filtro-rol"
                  className="w-full md:w-[210px] bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700"
                >
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.idrol} value={String(r.idrol)}>
                      {r.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="w-full bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm">
          {loadingUsers ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#1f3e97]" />
              Cargando usuarios...
            </div>
          ) : errorUsers ? (
            <div className="flex items-center justify-center gap-2 py-12 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errorUsers}
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
              <Users className="w-10 h-10 opacity-30" />
              <p className="text-sm italic">
                {usersData.length === 0
                  ? 'No hay usuarios registrados.'
                  : 'Ningún usuario coincide con los filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader className="border-b border-gray-300/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-gray-800 w-[120px]">DNI</TableHead>
                    <TableHead className="font-bold text-gray-800">Nombre y Apellido</TableHead>
                    <TableHead className="font-bold text-gray-800">Correo</TableHead>
                    <TableHead className="font-bold text-gray-800 w-[150px]">Rol</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((user) => (
                    <TableRow
                      key={user.idusuario}
                      className="border-b border-gray-300/30 hover:bg-white/10 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">{user.dni}</TableCell>
                      <TableCell className="text-gray-900 font-semibold">
                        {user.apellido}, {user.nombre}
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">{user.correo}</TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        {rolMap[user.idrol] ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs"
                          >
                            Modificar Campos
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs"
                          >
                            Dar de Baja
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        {!loadingUsers && !errorUsers && (
          <p className="text-xs text-gray-500 text-right mt-2">
            {usuariosFiltrados.length === 0
              ? 'Sin resultados'
              : `Mostrando ${usuariosFiltrados.length} de ${usersData.length} usuario${usersData.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Botón nuevo usuario */}
        <div className="mt-5">
          <Button className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-12 px-8 text-sm font-semibold tracking-wide shadow-md">
            NUEVO USUARIO
          </Button>
        </div>
      </section>

      {/* ── Section: Listado de Oficios (solo lectura) ── */}
      <section className="border-t border-gray-200 pt-8 pb-8">
        {/* Toggle header */}
        <button
          id="btn-toggle-listado-oficios"
          onClick={() => setShowOficiosList((prev) => !prev)}
          className="w-full flex items-center justify-between group mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1f3e97]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#1f3e97]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1f3e97]">
              Listado de Oficios
            </h2>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 group-hover:text-[#1f3e97] transition-colors">
            <span>{showOficiosList ? 'Ocultar' : 'Mostrar'}</span>
            {showOficiosList
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible content */}
        {showOficiosList && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <ListadoOficiosReadOnly />
          </div>
        )}
      </section>
    </div>
  );
}

