import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import AsignacionModal from '@/components/ui/AsignacionModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, RefreshCw, ChevronDown, ChevronUp, Clock, User, FileText } from 'lucide-react';
import { apiClient } from '@/api/client';

// ── Utilidad: normaliza un Date a clave "YYYY-MM-DD" en hora local ──────────
function toLocalDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── Tooltip/Popover de eventos del día ──────────────────────────────────────
function DayEventPopover({ events, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-auto"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(31,62,151,0.18))' }}
    >
      <div className="bg-white border border-blue-100 rounded-xl overflow-hidden text-left">
        <div className="bg-[#1f3e97] px-3 py-2">
          <p className="text-white text-xs font-bold tracking-wide uppercase">
            📋 Actas programadas
          </p>
        </div>
        <div className="divide-y divide-blue-50 max-h-52 overflow-y-auto">
          {events.map((ev, idx) => (
            <div key={idx} className="px-3 py-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#1f3e97] shrink-0" />
                <span className="text-[11px] font-semibold text-[#1f3e97]">{ev.hora}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <FileText className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-700 leading-tight">
                  {ev.nroInterno && (
                    <span className="font-semibold">Oficio {ev.nroInterno}</span>
                  )}
                  {ev.nroLegajo && ev.nroLegajo !== '—' && (
                    <span className="text-gray-500 ml-1">· Legajo {ev.nroLegajo}</span>
                  )}
                </div>
              </div>
              {ev.peritos.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <User className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-gray-600 leading-tight">
                    {ev.peritos.join(', ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div
        className="mx-auto w-3 h-3 bg-white border-b border-r border-blue-100 rotate-45 -mt-1.5"
        style={{ marginLeft: 'calc(50% - 6px)' }}
      />
    </div>
  );
}

// ── Botón de día personalizado con punto indicador y popover ────────────────
function CustomDayButton({ day, modifiers, eventsByDay, causas, oficios, peritos, oficioPeritoMap, ...props }) {
  const [open, setOpen] = useState(false);

  const dateKey = toLocalDateKey(day.date);
  const dayEvents = eventsByDay[dateKey] ?? [];
  const hasEvents = dayEvents.length > 0;

  const enrichedEvents = dayEvents.map((ev) => {
    const oficio = oficios.find((o) => o.idoficio === ev.idoficio);
    const causa = causas.find((c) => c.idcausa === oficio?.idcausa);
    const peritoIds = oficioPeritoMap[ev.idoficio] ?? [];
    const peritoNames = peritoIds.map((pid) => {
      const p = peritos.find((u) => u.idusuario === pid);
      if (!p) return `Perito #${pid}`;
      return `${p.nombre ?? p.name ?? ''} ${p.apellido ?? p.lastname ?? ''}`.trim();
    });
    return {
      hora: ev.hora,
      nroInterno: oficio?.nrointerno ?? '—',
      nroLegajo: causa?.nrolegajo ?? '—',
      peritos: peritoNames,
    };
  });

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <button
        {...props}
        onClick={(e) => {
          props.onClick?.(e);
          if (hasEvents) setOpen((o) => !o);
        }}
        onMouseEnter={() => hasEvents && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={[
          props.className,
          'relative isolate z-10 flex aspect-square h-8 w-8 mx-auto items-center justify-center flex-col gap-1 border-0 leading-none font-normal rounded-full',
          hasEvents ? 'ring-2 ring-[#1f3e97]/60 ring-offset-1' : '',
        ].filter(Boolean).join(' ')}
      >
        <span>{day.date.getDate()}</span>
        {hasEvents && (
          <span
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5"
            aria-hidden
          >
            {dayEvents.slice(0, 3).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-[#1f3e97]" />
            ))}
          </span>
        )}
      </button>
      {open && hasEvents && (
        <DayEventPopover events={enrichedEvents} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

export default function MesaEntradaDashboardView() {
  const navigate = useNavigate();
  const [calendarDate, setCalendarDate] = useState(new Date());

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

  // ── Mapa de eventos por día para el calendario ────────────────────────────
  // Formato: { "YYYY-MM-DD": [{ idoficio, hora }] }
  const eventsByDay = (() => {
    const map = {};
    actasList.forEach((acta) => {
      if (!acta.fechahorarealizacion) return;
      const dateKey = toLocalDateKey(acta.fechahorarealizacion);
      const hora = new Date(acta.fechahorarealizacion).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push({ idoficio: acta.idoficio, hora });
    });
    return map;
  })();

  // Días que tienen al menos un acta (para los modifiers del calendario)
  const daysWithEvents = Object.keys(eventsByDay).map((key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  });

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
        <div className="w-full lg:w-80 shrink-0">
          <h3 className="text-2xl font-bold text-[#1f3e97] mb-4 text-center">Calendario</h3>
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200">
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={setCalendarDate}
              className="w-full rounded-md"
              modifiers={{ hasEvent: daysWithEvents }}
              modifiersClassNames={{ hasEvent: 'rdp-day--has-event' }}
              components={{
                DayButton: (dayBtnProps) => (
                  <CustomDayButton
                    {...dayBtnProps}
                    eventsByDay={eventsByDay}
                    causas={causas}
                    oficios={oficios}
                    peritos={peritos}
                    oficioPeritoMap={oficioPeritoMap}
                  />
                ),
              }}
            />
            {/* Leyenda */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex gap-0.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1f3e97]" />
              </span>
              <span>Días con actas de apertura programadas</span>
            </div>
          </div>
        </div>
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
