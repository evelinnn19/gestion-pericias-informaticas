import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { apiClient } from '@/api/client';

/**
 * CargaOficioView
 *
 * Crea los siguientes registros en cascada:
 *   1. Causa (nroLegajo, caratula, fechaIngreso)
 *   2. Auto  (descripcionAuto, idCausa)
 *   3. Persona × víctima  + Auto_Persona { rolEnLaCausa: 'Víctima' }
 *   4. Persona × imputado + Auto_Persona { rolEnLaCausa: 'Imputado' }
 *   5. Oficio (nroInterno, idCausa, fiscalSolicitante, descripcionTareaOficio, prioridad)
 *
 * Los campos de Acta de Apertura y Perito son opcionales en este formulario;
 * la asignación formal se realiza desde el Dashboard de Mesa de Entrada.
 */
export default function CargaOficioView() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // ── Causa ──────────────────────────────────
    nroLegajo:    '',
    caratula:     '',
    fechaIngreso: '',
    // ── Oficio ─────────────────────────────────
    nroInterno:   '',
    fiscalSolicitante: '',
    prioridad:    'Normal',
    descripcionTareaOficio: '',
    observacionDeVinculacion: '',
    // ── Auto ───────────────────────────────────
    descripcionAuto: '',
    // ── Personas ───────────────────────────────
    victimas:   [{ nombre: '', apellido: '' }],
    imputados:  [{ nombre: '', apellido: '' }],
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Handlers genéricos ─────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePersonaChange = (field, index, key, value) => {
    setFormData((prev) => {
      const arr = [...prev[field]];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });
  };

  const addPersona = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { nombre: '', apellido: '' }],
    }));
  };

  const removePersona = (field, index) => {
    setFormData((prev) => {
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr.length > 0 ? arr : [{ nombre: '', apellido: '' }] };
    });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Crear Causa
      const resCausa = await apiClient.post('/causa', {
        nrolegajo:    formData.nroLegajo,
        caratula:     formData.caratula || formData.nroLegajo,
        fechaingreso: formData.fechaIngreso
          ? new Date(formData.fechaIngreso).toISOString()
          : new Date().toISOString(),
      });
      const idCausa = resCausa.data?.[0]?.idcausa ?? resCausa.data?.idcausa;
      if (!idCausa) throw new Error('No se pudo obtener el ID de la causa creada.');

      // 2. Crear Auto ligado a la Causa
      const resAuto = await apiClient.post('/auto', {
        idcausa: idCausa,
        descripcionauto: formData.descripcionAuto || `Auto de causa ${formData.nroLegajo}`,
      });
      const idAuto = resAuto.data?.[0]?.idauto ?? resAuto.data?.idauto;
      if (!idAuto) throw new Error('No se pudo obtener el ID del auto creado.');

      // 3. Crear víctimas → Persona + Auto_Persona
      for (const v of formData.victimas) {
        if (!v.nombre.trim()) continue;
        const resP = await apiClient.post('/persona', {
          nombre: v.nombre.trim(),
          apellido: v.apellido.trim(),
        });
        const idPersona = resP.data?.[0]?.idpersona ?? resP.data?.idpersona;
        if (idPersona) {
          await apiClient.post('/autopersona', { idauto: idAuto, idpersona: idPersona, rolenlacausa: 'Víctima' });
        }
      }

      // 4. Crear imputados → Persona + Auto_Persona
      for (const imp of formData.imputados) {
        if (!imp.nombre.trim()) continue;
        const resP = await apiClient.post('/persona', {
          nombre: imp.nombre.trim(),
          apellido: imp.apellido.trim(),
        });
        const idPersona = resP.data?.[0]?.idpersona ?? resP.data?.idpersona;
        if (idPersona) {
          await apiClient.post('/autopersona', { idauto: idAuto, idpersona: idPersona, rolenlacausa: 'Imputado' });
        }
      }

      // 5. Crear Oficio
      await apiClient.post('/oficio', {
        idcausa: idCausa,
        nrointerno: formData.nroInterno,
        fiscalsolicitante: formData.fiscalSolicitante,
        prioridad: formData.prioridad,
        descripciontareaoficio: formData.descripcionTareaOficio,
        observaciondevinculacion: formData.observacionDeVinculacion,
      });

      setSuccessMsg(`¡Oficio N° ${formData.nroInterno} cargado correctamente! Redirigiendo...`);
      setTimeout(() => navigate('/mesa-entrada-dashboard'), 2000);
    } catch (err) {
      console.error('Error al cargar oficio:', err);
      const detail = err?.response?.data?.error ?? err?.message ?? 'Error desconocido.';
      setErrorMsg(`Hubo un error al cargar el oficio: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#1f3e97] mb-2">
        Carga de Oficio
        {formData.nroInterno && (
          <span className="text-2xl font-semibold ml-2 text-blue-500">
            – N° {formData.nroInterno}
          </span>
        )}
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Complete los datos del nuevo oficio. La asignación de perito y fecha de apertura se realizará
        desde el panel principal.
      </p>

      {/* Mensajes de feedback */}
      {successMsg && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-800 font-medium">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <form className="space-y-10" onSubmit={handleSubmit}>

        {/* ── Sección: Oficio ─────────────────────────────────────────────── */}
        <section>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide border-b border-blue-100 pb-2">
            Datos del Oficio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">N° Interno del Oficio *</Label>
              <Input
                name="nroInterno"
                value={formData.nroInterno}
                onChange={handleChange}
                placeholder="Ej: 59/2026"
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Fiscal Solicitante *</Label>
              <Input
                name="fiscalSolicitante"
                value={formData.fiscalSolicitante}
                onChange={handleChange}
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Prioridad</Label>
              <div className="relative">
                <select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1f3e97]/30 focus:border-[#1f3e97] transition-all"
                >
                  <option>Normal</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Descripción de Tarea *</Label>
              <textarea
                name="descripcionTareaOficio"
                value={formData.descripcionTareaOficio}
                onChange={handleChange}
                rows={3}
                placeholder="Describa las tareas a realizar en el oficio..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1f3e97]/30 focus:border-[#1f3e97] transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Observación de Vinculación</Label>
              <textarea
                name="observacionDeVinculacion"
                value={formData.observacionDeVinculacion}
                onChange={handleChange}
                rows={3}
                placeholder="Observaciones adicionales (opcional)..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1f3e97]/30 focus:border-[#1f3e97] transition-all"
              />
            </div>
          </div>
        </section>

        {/* ── Sección: Causa ──────────────────────────────────────────────── */}
        <section>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide border-b border-blue-100 pb-2">
            Datos de la Causa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">N° Legajo *</Label>
              <Input
                name="nroLegajo"
                value={formData.nroLegajo}
                onChange={handleChange}
                placeholder="Ej: 4868/2026"
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Carátula *</Label>
              <Input
                name="caratula"
                value={formData.caratula}
                onChange={handleChange}
                placeholder="Carátula de la causa..."
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Fecha de Ingreso *</Label>
              <div className="relative">
                <Input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleChange}
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-[#1f3e97] pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Sección: AUTO (personas involucradas) ───────────────────────── */}
        <section>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide border-b border-blue-100 pb-2">
            Auto
          </h3>

          <div className="space-y-2 mb-6">
            <Label className="text-base font-semibold text-[#1f3e97]">Descripción del Auto *</Label>
            <textarea
              name="descripcionAuto"
              value={formData.descripcionAuto}
              onChange={handleChange}
              rows={2}
              placeholder="Descripción del auto judicial..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1f3e97]/30 focus:border-[#1f3e97] transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Víctimas */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-[#1f3e97]">Víctima/s *</Label>
              {formData.victimas.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nombre"
                    value={v.nombre}
                    onChange={(e) => handlePersonaChange('victimas', i, 'nombre', e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11 text-gray-700 flex-1"
                    required={i === 0}
                  />
                  <Input
                    placeholder="Apellido"
                    value={v.apellido}
                    onChange={(e) => handlePersonaChange('victimas', i, 'apellido', e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11 text-gray-700 flex-1"
                  />
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => removePersona('victimas', i)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPersona('victimas')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Agregar víctima
              </button>
            </div>

            {/* Imputados */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-[#1f3e97]">Imputado/s *</Label>
              {formData.imputados.map((imp, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nombre"
                    value={imp.nombre}
                    onChange={(e) => handlePersonaChange('imputados', i, 'nombre', e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11 text-gray-700 flex-1"
                    required={i === 0}
                  />
                  <Input
                    placeholder="Apellido"
                    value={imp.apellido}
                    onChange={(e) => handlePersonaChange('imputados', i, 'apellido', e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11 text-gray-700 flex-1"
                  />
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => removePersona('imputados', i)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPersona('imputados')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Agregar imputado
              </button>
            </div>
          </div>
        </section>

        {/* ── Botones de acción ────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-12 px-10 text-sm font-semibold tracking-wide disabled:opacity-50"
          >
            {loading ? 'GUARDANDO...' : 'CONFIRMAR'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => navigate('/mesa-entrada-dashboard')}
            className="border-2 border-[#1f3e97] text-[#1f3e97] hover:bg-blue-50 rounded-full h-12 px-10 text-sm font-semibold tracking-wide"
          >
            CANCELAR
          </Button>
        </div>

      </form>
    </div>
  );
}
