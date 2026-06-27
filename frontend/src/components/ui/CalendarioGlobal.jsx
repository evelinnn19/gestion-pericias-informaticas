import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User, FileText } from 'lucide-react';
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

// ── Hook para obtener datos del calendario (si no se tienen en la vista) ──
export function useCalendarioData() {
  const [calendarData, setCalendarData] = useState({
    actasList: [],
    oficios: [],
    causas: [],
    peritos: [],
    oficioPeritoMap: {}
  });

  const fetchCalendarData = useCallback(async () => {
    try {
      const [resOficios, resCausas, resActas, resUsuarios, resRoles, resOficioPerito] = await Promise.all([
        apiClient.get('/oficio'),
        apiClient.get('/causa'),
        apiClient.get('/actaapertura'),
        apiClient.get('/usuarios'),
        apiClient.get('/picklists/roles'),
        apiClient.get('/oficioperito'),
      ]);

      const opData = resOficioPerito.data ?? [];
      const opMap = {};
      opData.forEach((rel) => {
        if (!opMap[rel.idoficio]) opMap[rel.idoficio] = [];
        opMap[rel.idoficio].push(rel.idperito);
      });

      const rolesData = resRoles.data ?? [];
      const rolPerito = rolesData.find(
        (r) => String(r.descripcion ?? r.nombre ?? '').toLowerCase() === 'perito'
      );
      const idRolPerito = rolPerito?.idrol ?? null;

      const usuariosRaw = resUsuarios.data ?? [];
      const filteredPeritos = idRolPerito
        ? usuariosRaw.filter((u) => u.idrol === idRolPerito)
        : usuariosRaw;

      setCalendarData({
        actasList: resActas.data ?? [],
        oficios: resOficios.data ?? [],
        causas: resCausas.data ?? [],
        peritos: filteredPeritos,
        oficioPeritoMap: opMap,
      });
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  return calendarData;
}

// ── Componente Principal ────────────────────────────────────────────────────
export default function CalendarioGlobal({
  actasList = [],
  oficios = [],
  causas = [],
  peritos = [],
  oficioPeritoMap = {},
  className = ''
}) {
  const [calendarDate, setCalendarDate] = useState(new Date());

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

  return (
    <div className={`w-full lg:w-80 shrink-0 ${className}`}>
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
  );
}
