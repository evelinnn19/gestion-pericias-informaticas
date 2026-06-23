import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, UserCheck, Calendar, Clock, AlertCircle } from 'lucide-react';

/**
 * Modal para asignar perito y fecha/hora de apertura a un oficio pendiente.
 *
 * Props:
 *   oficio   - { idOficio, nroInterno, nroLegajo }
 *   peritos  - [{ idUsuario, nombre, apellido }]
 *   onConfirm(idOficio, idPerito, fechaHoraRealizacion) - callback async
 *   onClose  - callback al cancelar o cerrar
 */
export default function AsignacionModal({ oficio, peritos, onConfirm, onClose }) {
  const [peritoId, setPeritoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!peritoId) { setError('Debe seleccionar un perito.'); return; }
    if (!fecha)    { setError('Debe ingresar la fecha de apertura.'); return; }
    if (!hora)     { setError('Debe ingresar la hora de apertura.'); return; }

    // Combinar fecha y hora en timestamp ISO
    const fechaHoraRealizacion = new Date(`${fecha}T${hora}:00`).toISOString();

    setLoading(true);
    try {
      await onConfirm(oficio.idOficio, parseInt(peritoId, 10), fechaHoraRealizacion);
    } catch (err) {
      setError(err?.message || 'Error al asignar. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1f3e97] rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-bold tracking-wide">Asignar Perito y Fecha</h2>
            <p className="text-blue-200 text-sm mt-0.5">
              Oficio <span className="font-semibold text-white">{oficio?.nroInterno}</span>
              {oficio?.nroLegajo && (
                <span className="ml-2 text-blue-300">· Legajo {oficio.nroLegajo}</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Perito selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#1f3e97] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Perito Asignado *
            </Label>
            <div className="relative">
              <select
                id="asig-perito"
                value={peritoId}
                onChange={(e) => setPeritoId(e.target.value)}
                className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1f3e97]/30 focus:border-[#1f3e97] transition-all"
                required
              >
                <option value="">— Seleccionar perito —</option>
                {peritos.map((p) => (
                  <option key={p.idusuario} value={p.idusuario}>
                    {p.nombre ?? p.name ?? ''} {p.apellido ?? p.lastname ?? ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▾
              </div>
            </div>
            {peritos.length === 0 && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                No hay peritos disponibles en el sistema.
              </p>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asig-fecha" className="text-sm font-semibold text-[#1f3e97] flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Fecha *
              </Label>
              <Input
                id="asig-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asig-hora" className="text-sm font-semibold text-[#1f3e97] flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Hora *
              </Label>
              <Input
                id="asig-hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                required
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-11 text-sm font-semibold tracking-wide disabled:opacity-50 transition-all"
            >
              {loading ? 'Guardando...' : 'CONFIRMAR ASIGNACIÓN'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-[#1f3e97] text-[#1f3e97] hover:bg-blue-50 rounded-full h-11 text-sm font-semibold"
            >
              CANCELAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
