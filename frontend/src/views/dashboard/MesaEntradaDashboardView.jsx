import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import CalendarioGlobal from '@/components/ui/CalendarioGlobal';
import AsignacionModal from '@/components/ui/AsignacionModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '@/api/client';
export default function MesaEntradaDashboardView() {
  const navigate = useNavigate();

  // ── Datos del backend ──────────────────────────────────────────────────────
  const [oficios, setOficios] = useState([]);        // todos los oficios (con causa)
  const [causas, setCausas] = useState([]);           // todas las causas
  const [peritos, setPeritos] = useState([]);         // usuarios con rol "perito"
  const [actasIds, setActasIds] = useState(new Set()); // Set de idOficio que ya tienen acta
  const [actasList, setActasList] = useState([]);     // lista completa de actas (para el calendario)
  const [oficioPeritoMap, setOficioPeritoMap] = useState({}); // { idoficio: [idperito, ...] }

  // ── UI state ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroNarco, setFiltroNarco] = useState(false);
  const [filtroGeneral, setFiltroGeneral] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set()); // para mostrar/ocultar dispositivos

  // ── Modal de asignación ────────────────────────────────────────────────────
  const [modalOficio, setModalOficio] = useState(null); // oficio seleccionado para asignar

  // ── Fetch de datos ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [resOficios, resCausas, resActas, resUsuarios, resRoles, resOficioPerito] = await Promise.all([
        apiClient.get('/oficio'),
        apiClient.get('/causa'),
        apiClient.get('/actaapertura'),
        apiClient.get('/usuarios'),
        apiClient.get('/picklists/roles'),
        apiClient.get('/oficioperito'),
      ]);

      setOficios(resOficios.data ?? []);
      setCausas(resCausas.data ?? []);

      // Guardar lista completa de actas para el calendario
      const actasData = resActas.data ?? [];
      setActasList(actasData);

      // Construir Set con idoficio que ya tienen acta de apertura
      const idsConActa = new Set(actasData.map((a) => a.idoficio));
      setActasIds(idsConActa);

      // Construir mapa oficio → peritos asignados
      const opData = resOficioPerito.data ?? [];
      const opMap = {};
      opData.forEach((rel) => {
        if (!opMap[rel.idoficio]) opMap[rel.idoficio] = [];
        opMap[rel.idoficio].push(rel.idperito);
      });
      setOficioPeritoMap(opMap);

      // Obtener el idrol del rol "perito" de forma dinámica
      const rolesData = resRoles.data ?? [];
      const rolPerito = rolesData.find(
        (r) => String(r.descripcion ?? r.nombre ?? '').toLowerCase() === 'perito'
      );
      const idRolPerito = rolPerito?.idrol ?? null;

      // Filtrar usuarios que sean peritos
      const usuariosRaw = resUsuarios.data ?? [];
      const filteredPeritos = idRolPerito
        ? usuariosRaw.filter((u) => u.idrol === idRolPerito)
        : usuariosRaw; // fallback: mostrar todos si no se encontró el rol

      setPeritos(filteredPeritos);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setLoadError('No se pudieron cargar los datos. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Busca la causa asociada a un oficio y retorna su nroLegajo */
  const getNroLegajo = (idcausa) => {
    const causa = causas.find((c) => c.idcausa === idcausa);
    return causa?.nrolegajo ?? '—';
  };

  /** Oficios sin acta de apertura = pendientes de asignación */
  const pendientes = oficios.filter((o) => !actasIds.has(o.idoficio));

  /** Oficios con acta (ya asignados), con filtros de búsqueda */
  const oficiosAsignados = oficios
    .filter((o) => actasIds.has(o.idoficio))
    .filter((o) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.nrointerno?.toLowerCase().includes(q) ||
        getNroLegajo(o.idcausa)?.toLowerCase().includes(q) ||
        o.fiscalsolicitante?.toLowerCase().includes(q) ||
        o.descripciontareaoficio?.toLowerCase().includes(q)
      );
    });

  /** Toggle mostrar/ocultar dispositivos de un oficio en la tabla */
  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Manejo de asignación ───────────────────────────────────────────────────
  const handleAsignar = async (idOficio, idPerito, fechaHoraRealizacion) => {
    // 1. Crear el acta de apertura
    await apiClient.post('/actaapertura', {
      idoficio: idOficio,
      fechahorarealizacion: fechaHoraRealizacion,
    });

    // 2. Crear la relación oficio-perito
    await apiClient.post('/oficioperito', {
      idoficio: idOficio,
      idperito: idPerito,
    });

    // 3. Cerrar modal y refrescar datos
    setModalOficio(null);
    await fetchData();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)]">

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {loadError && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <button
            onClick={fetchData}
            className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      )}

      {/* ── Fila superior: Botones + Pendientes ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">

        {/* Botones de acción */}
        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <Button
            onClick={() => navigate('/carga-oficio')}
            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-14 text-sm font-bold tracking-wide shadow-md"
          >
            CARGAR NUEVO OFICIO
          </Button>
          <Button className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-14 text-sm font-bold tracking-wide shadow-md">
            DEVOLUCIÓN DE DISPOSITIVO
          </Button>
          <Button className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-14 text-sm font-bold tracking-wide shadow-md">
            GENERAR INFORME
          </Button>
        </div>

        {/* Oficios Pendientes de Asignación */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1f3e97]">
              Oficios Pendientes de Asignación
              {!loading && pendientes.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                  {pendientes.length}
                </span>
              )}
            </h2>
            <button
              onClick={fetchData}
              className="text-gray-400 hover:text-[#1f3e97] transition-colors p-1 rounded-lg hover:bg-gray-100"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm max-h-52 overflow-y-auto">
            <Table>
              <TableHeader className="border-b border-gray-300/50 sticky top-0 bg-[#d0d7e8]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-800">N° Interno</TableHead>
                  <TableHead className="font-bold text-gray-800">N° Legajo</TableHead>
                  <TableHead className="font-bold text-gray-800">Fiscal</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                      Cargando...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && pendientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                      ✓ No hay oficios pendientes de asignación
                    </TableCell>
                  </TableRow>
                )}
                {!loading && pendientes.map((item) => (
                  <TableRow
                    key={item.idoficio}
                    className="border-b border-gray-300/30 hover:bg-white/20 transition-colors"
                  >
                    <TableCell className="font-semibold text-gray-900">{item.nrointerno}</TableCell>
                    <TableCell className="text-gray-900">{getNroLegajo(item.idcausa)}</TableCell>
                    <TableCell className="text-gray-700 text-sm truncate max-w-[140px]">
                      {item.fiscalsolicitante ?? '—'}
                    </TableCell>
                    <TableCell className="text-right pr-3">
                      <Button
                        size="sm"
                        onClick={() =>
                          setModalOficio({
                            idOficio: item.idoficio,
                            nroInterno: item.nrointerno,
                            nroLegajo: getNroLegajo(item.idcausa),
                          })
                        }
                        className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs whitespace-nowrap"
                      >
                        ASIGNAR PERITO Y FECHA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ── Fila inferior: Monitor + Calendario ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Tabla principal de oficios asignados */}
        <div className="flex-1 flex flex-col">
          {/* Búsqueda y filtros */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por N° Legajo, N° Interno, Fiscal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 rounded-full h-12 text-base text-gray-700 w-full"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delitos-generales"
                  checked={filtroGeneral}
                  onCheckedChange={setFiltroGeneral}
                  className="border-[#1f3e97] data-[state=checked]:bg-[#1f3e97] data-[state=checked]:text-white"
                />
                <Label htmlFor="delitos-generales" className="text-sm font-semibold text-[#1f3e97]">
                  Delitos Generales
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delitos-narcomenudeo"
                  checked={filtroNarco}
                  onCheckedChange={setFiltroNarco}
                  className="border-[#1f3e97] data-[state=checked]:bg-[#1f3e97] data-[state=checked]:text-white"
                />
                <Label htmlFor="delitos-narcomenudeo" className="text-sm font-semibold text-[#1f3e97]">
                  Delitos de Narcomenudeo
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm flex-1 min-h-[300px]">
            <Table>
              <TableHeader className="border-b border-gray-300/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-800">N° Interno</TableHead>
                  <TableHead className="font-bold text-gray-800">N° Legajo</TableHead>
                  <TableHead className="font-bold text-gray-800">Fiscal Solicitante</TableHead>
                  <TableHead className="font-bold text-gray-800">Fecha de Apertura</TableHead>
                  <TableHead className="font-bold text-gray-800">Estado</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                      Cargando oficios...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && oficiosAsignados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      {searchQuery ? 'Sin resultados para la búsqueda.' : 'No hay oficios registrados.'}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && oficiosAsignados.map((item) => {
                  const isExpanded = expandedRows.has(item.idoficio);
                  const fechaApertura = item.fechahoraapertura
                    ? new Date(item.fechahoraapertura).toLocaleString('es-AR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                    : '—';

                  return (
                    <TableRow
                      key={item.idoficio}
                      className="border-b border-gray-300/30 hover:bg-white/10 transition-colors align-top"
                    >
                      <TableCell>
                        <div className="font-semibold text-gray-900">{item.nrointerno}</div>
                        {item.descripciontareaoficio && (
                          <>
                            <button
                              onClick={() => toggleRow(item.idoficio)}
                              className="mt-1 text-[10px] text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {isExpanded ? 'Ocultar descripción' : 'Ver descripción'}
                            </button>
                            {isExpanded && (
                              <div className="mt-1 ml-1 text-xs text-gray-700 font-medium max-w-[220px]">
                                {item.descripciontareaoficio}
                              </div>
                            )}
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 font-bold">{getNroLegajo(item.idcausa)}</TableCell>
                      <TableCell className="text-gray-800 text-sm">{item.fiscalsolicitante ?? '—'}</TableCell>
                      <TableCell className="text-gray-800 text-sm">{fechaApertura}</TableCell>
                      <TableCell>
                        <span className="bg-[#d4e157] text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                          En Proceso
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs"
                          >
                            Ver Detalles
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs"
                          >
                            Reprogramar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Calendario */}
        <CalendarioGlobal
          actasList={actasList}
          oficios={oficios}
          causas={causas}
          peritos={peritos}
          oficioPeritoMap={oficioPeritoMap}
        />
      </div>

      {/* ── Modal de asignación ────────────────────────────────────────────── */}
      {modalOficio && (
        <AsignacionModal
          oficio={modalOficio}
          peritos={peritos}
          onConfirm={handleAsignar}
          onClose={() => setModalOficio(null)}
        />
      )}
    </div>
  );
}
