import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, CheckCircle, Loader2, Zap, Smartphone, Search } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

/**
 * CargaOficioView
 *
 * Cascade de creación:
 *  1. Causa  (nrolegajo, caratula, fechaingreso=manual, iddelito)
 *  2. Auto   (descripcionauto autogenerada)
 *  3. Persona × víctima  + auto_persona
 *  4. Persona × imputado + auto_persona
 *  5. Dispositivo × N    + oficio_dispositivo  (idestadooperativo = 1 por defecto)
 *  6. Oficio (nrointerno autogenerado, fechahoraapertura opcional)
 *  7. oficio_perito (si se eligió perito)
 *  8. PUT causa → idestadocausa = 2 (En Proceso)
 *
 * Autocompletado de legajo:
 *  Si el nroLegajo ingresado ya existe en la BD, se autocompletan caratula,
 *  fiscalSolicitante, idDelito, víctimas e imputados desde la causa/auto existentes.
 *  Todos los campos de Causa y Auto quedan en solo lectura; solo los campos
 *  del nuevo Oficio y la sección de Dispositivos permanecen editables.
 */

// ── Clase CSS compartida para selects ───────────────────────────────────────
const SELECT_CLS =
  'w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1f3e97]/30 focus:border-[#1f3e97] transition-all disabled:opacity-50';

export default function CargaOficioView() {
  const navigate = useNavigate();
  const anioActual = new Date().getFullYear();
  const legajoDebounceRef = useRef(null);

  // ── Picklists ──────────────────────────────────────────────────────────────
  const [tiposDelito, setTiposDelito] = useState([]);
  const [tiposDisp, setTiposDisp] = useState([]);
  const [peritos, setPeritos] = useState([]);
  const [loadingPL, setLoadingPL] = useState(true);

  // ── Autocompletado de legajo ───────────────────────────────────────────────
  const [legajoLookupStatus, setLegajoLookupStatus] = useState('idle'); // 'idle' | 'loading' | 'found' | 'new'
  const [causaExistente, setCausaExistente] = useState(null); // causa encontrada en BD

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    // Causa
    nroLegajo: '',
    caratula: '',
    idDelito: '',
    fechaIngreso: '',        // → causa.fechaingreso (manual)
    // Oficio
    fiscalSolicitante: '',
    descripcionTareaOficio: '',
    fechaApertura: '',       // → oficio.fechahoraapertura (parte fecha)
    horaApertura: '',        // → oficio.fechahoraapertura (parte hora)
    // Asignación
    idPerito: '',
    // Personas
    victimas: [{ nombre: '', apellido: '' }],
    imputados: [{ nombre: '', apellido: '' }],
    // Dispositivos
    dispositivos: [{ idtipodispositivo: '', marca: '', ubicacionfisica: '', propietario: '' }],
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Cargar picklists al montar ─────────────────────────────────────────────
  useEffect(() => {
    const fetchPicklists = async () => {
      setLoadingPL(true);
      try {
        const [resDelitos, resDisp, resUsuarios, resRoles] = await Promise.all([
          apiClient.get('/picklists/tipodelito'),
          apiClient.get('/picklists/tipodispositivo'),
          apiClient.get('/usuarios'),
          apiClient.get('/picklists/roles'),
        ]);

        setTiposDelito(resDelitos.data ?? []);
        setTiposDisp(resDisp.data ?? []);

        // Filtrar peritos dinámicamente por el idrol que corresponda
        const rolesData = resRoles.data ?? [];
        const rolPerito = rolesData.find(
          (r) => String(r.descripcion ?? '').toLowerCase() === 'perito'
        );
        const idRolPerito = rolPerito?.idrol ?? null;
        const usuariosRaw = resUsuarios.data ?? [];
        setPeritos(
          idRolPerito
            ? usuariosRaw.filter((u) => u.idrol === idRolPerito)
            : usuariosRaw
        );
      } catch (err) {
        console.error('Error al cargar listas desplegables:', err);
      } finally {
        setLoadingPL(false);
      }
    };
    fetchPicklists();
  }, []);

  // ── Autocompletado: busca la causa cuando el legajo cambia ────────────────
  const buscarCausaPorLegajo = async (nroLegajo) => {
    const val = nroLegajo.trim();
    if (!val) {
      setLegajoLookupStatus('idle');
      setCausaExistente(null);
      return;
    }
    setLegajoLookupStatus('loading');
    try {
      const res = await apiClient.get('/causa');
      const causas = res.data ?? [];
      const encontrada = causas.find(
        (c) => String(c.nrolegajo ?? '').trim().toLowerCase() === val.toLowerCase()
      );

      if (encontrada) {
        setCausaExistente(encontrada);
        setLegajoLookupStatus('found');

        // ── Autocompletar datos de la causa ──────────────────────────────────
        const patchData = {
          caratula: encontrada.caratula ?? '',
          idDelito: encontrada.iddelito ? String(encontrada.iddelito) : '',
          fiscalSolicitante: encontrada.fiscalsolicitante ?? '',
        };

        // ── Buscar el Auto vinculado a la causa y sus personas ───────────────
        try {
          const [resAutos, resPersonas] = await Promise.all([
            apiClient.get('/auto'),
            apiClient.get('/autopersona'),
          ]);

          const autos = resAutos.data ?? [];
          const autoDeLaCausa = autos.find(
            (a) => String(a.idcausa) === String(encontrada.idcausa)
          );

          if (autoDeLaCausa) {
            const todasLasRelaciones = resPersonas.data ?? [];
            const relacionesDeEsteAuto = todasLasRelaciones.filter(
              (r) => String(r.idauto) === String(autoDeLaCausa.idauto)
            );

            // Obtener detalle de cada persona
            const resAllPersonas = await apiClient.get('/persona');
            const todasLasPersonas = resAllPersonas.data ?? [];

            const victimas = relacionesDeEsteAuto
              .filter((r) => String(r.rolenlacausa ?? '').toLowerCase() === 'víctima')
              .map((r) => {
                const p = todasLasPersonas.find(
                  (pp) => String(pp.idpersona) === String(r.idpersona)
                );
                return p ? { nombre: p.nombre ?? '', apellido: p.apellido ?? '' } : null;
              })
              .filter(Boolean);

            const imputados = relacionesDeEsteAuto
              .filter((r) => String(r.rolenlacausa ?? '').toLowerCase() === 'imputado')
              .map((r) => {
                const p = todasLasPersonas.find(
                  (pp) => String(pp.idpersona) === String(r.idpersona)
                );
                return p ? { nombre: p.nombre ?? '', apellido: p.apellido ?? '' } : null;
              })
              .filter(Boolean);

            if (victimas.length > 0) patchData.victimas = victimas;
            if (imputados.length > 0) patchData.imputados = imputados;
          }
        } catch (errPersonas) {
          console.warn('No se pudieron cargar personas del auto:', errPersonas);
        }

        setFormData((prev) => ({ ...prev, ...patchData }));
      } else {
        setCausaExistente(null);
        setLegajoLookupStatus('new');
      }
    } catch (err) {
      console.error('Error buscando causa por legajo:', err);
      setLegajoLookupStatus('idle');
    }
  };

  // ── Descripción del Auto autogenerada ──────────────────────────────────────
  const descripcionAutoGenerada = useMemo(() => {
    const imputadoNombres = formData.imputados
      .filter((i) => i.nombre.trim())
      .map((i) => `${i.nombre.trim()} ${i.apellido.trim()}`.trim())
      .join(', ');

    const victimaNombres = formData.victimas
      .filter((v) => v.nombre.trim())
      .map((v) => `${v.nombre.trim()} ${v.apellido.trim()}`.trim())
      .join(', ');

    const cantidadImputados = formData.imputados.filter((i) => i.nombre.trim()).length;
    const conector = cantidadImputados > 1 ? 'son imputados' : 'es imputado';

    const delitoLabel =
      tiposDelito.find((d) => String(d.iddelito) === String(formData.idDelito))?.descripcion ?? '';

    if (!imputadoNombres && !victimaNombres && !delitoLabel) return '';

    const partes = [];
    if (imputadoNombres) partes.push(`${imputadoNombres} ${conector}`);
    if (delitoLabel) partes.push(`por el delito de ${delitoLabel}`);
    if (victimaNombres) partes.push(`a ${victimaNombres}`);

    return partes.join(' ');
  }, [formData.victimas, formData.imputados, formData.idDelito, tiposDelito]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Disparar búsqueda de legajo con debounce de 600ms
    if (name === 'nroLegajo') {
      if (legajoDebounceRef.current) clearTimeout(legajoDebounceRef.current);
      legajoDebounceRef.current = setTimeout(() => buscarCausaPorLegajo(value), 600);
    }
  };

  const handlePersonaChange = (field, index, key, value) =>
    setFormData((prev) => {
      const arr = [...prev[field]];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });

  const addPersona = (field) =>
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { nombre: '', apellido: '' }],
    }));

  const removePersona = (field, index) =>
    setFormData((prev) => {
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr.length > 0 ? arr : [{ nombre: '', apellido: '' }] };
    });

  const handleDispositivoChange = (index, key, value) =>
    setFormData((prev) => {
      const arr = [...prev.dispositivos];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, dispositivos: arr };
    });

  const addDispositivo = () =>
    setFormData((prev) => ({
      ...prev,
      dispositivos: [...prev.dispositivos, { idtipodispositivo: '', marca: '', ubicacionfisica: '', propietario: '' }],
    }));

  const removeDispositivo = (index) =>
    setFormData((prev) => {
      const arr = prev.dispositivos.filter((_, i) => i !== index);
      return { ...prev, dispositivos: arr.length > 0 ? arr : [{ idtipodispositivo: '', marca: '', ubicacionfisica: '', propietario: '' }] };
    });

  // ── Construir datetime de apertura ────────────────────────────────────────
  const buildFechaHoraApertura = () => {
    if (!formData.fechaApertura) return null;
    const hora = formData.horaApertura || '00:00';
    return new Date(`${formData.fechaApertura}T${hora}:00`).toISOString();
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // ── Generar nroInterno: count + 1 / año ────────────────────────────────
      const resOficios = await apiClient.get('/oficio');
      const nroInterno = `${(resOficios.data ?? []).length + 1}/${anioActual}`;

      let idCausa;

      if (causaExistente) {
        // Legajo ya existente: reutilizar la causa encontrada
        idCausa = causaExistente.idcausa;
      } else {
        // ── 1. Crear Causa (fechaingreso = manual) ───────────────────────────
        const causaPayload = {
          nrolegajo: formData.nroLegajo,
          caratula: formData.caratula || formData.nroLegajo,
          fechaingreso: formData.fechaIngreso
            ? new Date(formData.fechaIngreso).toISOString()
            : new Date().toISOString(),
        };
        if (formData.idDelito) causaPayload.iddelito = parseInt(formData.idDelito, 10);

        const resCausa = await apiClient.post('/causa', causaPayload);
        idCausa = resCausa.data?.[0]?.idcausa ?? resCausa.data?.idcausa;
        if (!idCausa) throw new Error('No se pudo obtener el ID de la causa creada.');
      }

      // ── 2. Crear Auto (descripción autogenerada) ───────────────────────────
      const resAuto = await apiClient.post('/auto', {
        idcausa: idCausa,
        descripcionauto: descripcionAutoGenerada || `Auto de causa ${formData.nroLegajo}`,
      });
      const idAuto = resAuto.data?.[0]?.idauto ?? resAuto.data?.idauto;
      if (!idAuto) throw new Error('No se pudo obtener el ID del auto creado.');

      // ── 3. Personas → víctimas ─────────────────────────────────────────────
      for (const v of formData.victimas) {
        if (!v.nombre.trim()) continue;
        const resP = await apiClient.post('/persona', {
          nombre: v.nombre.trim(),
          apellido: v.apellido.trim() || '',
        });
        const idPersona = resP.data?.[0]?.idpersona ?? resP.data?.idpersona;
        if (idPersona) {
          await apiClient.post('/autopersona', { idauto: idAuto, idpersona: idPersona, rolenlacausa: 'Víctima' });
        }
      }

      // ── 4. Personas → imputados ────────────────────────────────────────────
      for (const imp of formData.imputados) {
        if (!imp.nombre.trim()) continue;
        const resP = await apiClient.post('/persona', {
          nombre: imp.nombre.trim(),
          apellido: imp.apellido.trim() || '',
        });
        const idPersona = resP.data?.[0]?.idpersona ?? resP.data?.idpersona;
        if (idPersona) {
          await apiClient.post('/autopersona', { idauto: idAuto, idpersona: idPersona, rolenlacausa: 'Imputado' });
        }
      }

      // ── 5. Crear Oficio ────────────────────────────────────────────────────
      const oficioPayload = {
        idcausa: idCausa,
        nrointerno: nroInterno,
        fiscalsolicitante: formData.fiscalSolicitante.trim() || 'Sin datos',
        descripciontareaoficio: formData.descripcionTareaOficio.trim() || 'Sin descripción',
      };
      const fechaHoraApertura = buildFechaHoraApertura();
      if (fechaHoraApertura) {
        oficioPayload.fechahoraapertura = fechaHoraApertura;
      }

      const resOficio = await apiClient.post('/oficio', oficioPayload);
      const idOficio = resOficio.data?.[0]?.idoficio ?? resOficio.data?.idoficio;
      if (!idOficio) throw new Error('No se pudo obtener el ID del oficio creado.');

      // ── 6. Dispositivos secuestrados → dispositivo + oficio_dispositivo ────
      for (const disp of formData.dispositivos) {
        if (!disp.idtipodispositivo) continue;

        const resDisp = await apiClient.post('/dispositivo', {
          idtipodispositivo: parseInt(disp.idtipodispositivo, 10),
          marca: disp.marca?.trim() || '',
          ubicacionfisica: disp.ubicacionfisica?.trim() || '',
          propietario: disp.propietario?.trim() || '',
          modelo: disp.modelo?.trim() || '',
        });
        const idDispositivo = resDisp.data?.[0]?.iddispositivo ?? resDisp.data?.iddispositivo;

        if (idDispositivo) {
          await apiClient.post('/oficiodispositivo', {
            idoficio: idOficio,
            iddispositivo: idDispositivo,
            idestadooperativo: 1,
          });
        }
      }

      // ── 7. Asignar perito (si fue elegido) ────────────────────────────────
      if (formData.idPerito) {
        await apiClient.post('/oficioperito', {
          idoficio: idOficio,
          idperito: parseInt(formData.idPerito, 10),
        });
      }

      // ── 8. Actualizar estado de la Causa → En Proceso (idestadocausa = 2) ─
      await apiClient.put(`/causa/${idCausa}`, { idestadocausa: 2 });

      toast.success(`¡Oficio N° ${nroInterno} cargado correctamente! Redirigiendo...`);
      setTimeout(() => navigate('/mesa-entrada-dashboard'), 2000);
    } catch (err) {
      console.error('Error al cargar oficio:', err);
      const detail = err?.response?.data?.error ?? err?.message ?? 'Error desconocido.';
      toast.error(`Hubo un error al cargar el oficio: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Badge de estado del autocompletado de legajo ──────────────────────────
  const legajoBadge = () => {
    if (legajoLookupStatus === 'loading') return (
      <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
        <Loader2 className="w-3 h-3 animate-spin" /> Buscando legajo...
      </span>
    );
    if (legajoLookupStatus === 'found') return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
        <CheckCircle className="w-3.5 h-3.5" /> Legajo existente — campos autocompletados
      </span>
    );
    if (legajoLookupStatus === 'new') return (
      <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
        <Zap className="w-3 h-3" /> Legajo nuevo — complete los datos de la causa
      </span>
    );
    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#1f3e97] mb-2">Carga de Oficio</h1>
      <p className="text-gray-500 text-sm mb-6">
        Complete los datos del nuevo oficio. El N° Interno y la descripción del Auto se generan
        automáticamente. Si el legajo ya existe, los datos de la causa se autocompletarán.
      </p>

      {/* N° interno preview */}
      <div className="mb-8 inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
        <Zap className="w-4 h-4 text-[#1f3e97] shrink-0" />
        <span className="text-sm text-gray-600">
          N° Interno asignado automáticamente:{' '}
          <span className="font-bold text-[#1f3e97]">(próximo disponible)/{anioActual}</span>
        </span>
      </div>

      {/* Feedback */}
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

        {/* ── Sección: Datos del Oficio ────────────────────────────────────── */}
        <section>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide border-b border-blue-100 pb-2">
            Datos del Oficio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Fecha apertura de sobres + Hora */}
            <div className="flex gap-3 w-full">
              <div className="flex-1 space-y-2">
                <Label className="text-base font-semibold text-[#1f3e97]">Fecha apertura de sobres</Label>
                <Input
                  type="date"
                  name="fechaApertura"
                  value={formData.fechaApertura}
                  onChange={handleChange}
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 flex-1"
                />
              </div>
              <div className="min-w-[130px] space-y-2">
                <span className="text-xs text-gray-400 font-medium pl-1">Hora</span>
                <Input
                  type="time"
                  name="horaApertura"
                  value={formData.horaApertura}
                  onChange={handleChange}
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                />
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

            {/* Perito asignado */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Perito Asignado</Label>
              <div className="relative">
                <select
                  name="idPerito"
                  value={formData.idPerito}
                  onChange={handleChange}
                  className={SELECT_CLS}
                  disabled={loadingPL}
                >
                  <option value="">— Sin asignar —</option>
                  {peritos.map((p) => (
                    <option key={p.idusuario} value={p.idusuario}>
                      {p.nombre ?? ''} {p.apellido ?? ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  {loadingPL ? <Loader2 className="w-4 h-4 animate-spin" /> : '▾'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sección: Datos de la Causa ───────────────────────────────────── */}
        <section>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide border-b border-blue-100 pb-2">
            Datos de la Causa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* N° Legajo con autocompletado */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97] flex items-center gap-1.5">
                <Search className="w-4 h-4" /> N° Legajo *
              </Label>
              <Input
                name="nroLegajo"
                value={formData.nroLegajo}
                onChange={handleChange}
                placeholder="Ej: 4868/2026"
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                required
              />
              <div className="min-h-[1.25rem]">{legajoBadge()}</div>
            </div>

            {/* Fecha de ingreso del oficio (manual) */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Fecha de Ingreso del Oficio *</Label>
              <Input
                type="date"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleChange}
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
                disabled={!!causaExistente}
                required={!causaExistente}
              />
              {causaExistente && (
                <p className="text-xs text-gray-400">Causa existente — fecha ya registrada.</p>
              )}
            </div>

            {/* Tipo de Delito */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Tipo de Delito *</Label>
              <div className="relative">
                {loadingPL ? (
                  <div className="h-12 flex items-center px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                  </div>
                ) : (
                  <>
                    <select
                      name="idDelito"
                      value={formData.idDelito}
                      onChange={handleChange}
                      className={SELECT_CLS}
                      required
                      disabled={!!causaExistente}
                    >
                      <option value="">— Seleccionar —</option>
                      {tiposDelito.map((d) => (
                        <option key={d.iddelito} value={d.iddelito}>
                          {d.descripcion}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Carátula */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#1f3e97]">Carátula *</Label>
            <Input
              name="caratula"
              value={formData.caratula}
              onChange={handleChange}
              placeholder="Carátula de la causa..."
              className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700"
              required
              disabled={!!causaExistente}
            />
          </div>

          {/* Banner de causa existente */}
          {causaExistente && (
            <div className="mt-4 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Causa existente detectada</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Los campos de la causa y el auto (víctimas e imputados) han sido autocompletados
                  y quedan en modo solo lectura. Complete los datos del nuevo oficio y agregue
                  los dispositivos correspondientes.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── Sección: Auto ────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide border-b border-blue-100 pb-2 flex items-center gap-2">
            Auto
            {causaExistente && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-6v2m0 6h.01M6.938 4h10.124A2 2 0 0119 5.882l1 14A2 2 0 0118.062 22H5.938A2 2 0 014 19.882l1-14A2 2 0 016.938 4z" /></svg>
                Solo lectura
              </span>
            )}
          </h3>

          {/* Preview Auto autogenerado */}
          <div className="mb-6 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-5 py-4">
            <p className="text-xs font-semibold text-[#1f3e97] uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Descripción del Auto (autogenerada)
            </p>
            <p className="text-sm text-gray-700 font-medium min-h-[1.5rem]">
              {descripcionAutoGenerada || (
                <span className="text-gray-400 italic">
                  Se construye automáticamente al ingresar imputados, delito y víctimas.
                </span>
              )}
            </p>
            {descripcionAutoGenerada && (
              <p className="text-xs text-gray-400 mt-2">
                Formato: [Imputados] es/son imputado/s · por el delito de [Delito] · a [Víctimas]
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Víctimas */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-[#1f3e97]">Víctima/s {!causaExistente && '*'}</Label>
              {formData.victimas.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nombre"
                    value={v.nombre}
                    onChange={(e) => handlePersonaChange('victimas', i, 'nombre', e.target.value)}
                    className={`rounded-xl h-11 text-gray-700 flex-1 border-gray-200 ${causaExistente
                      ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                      : 'bg-gray-50'
                      }`}
                    readOnly={!!causaExistente}
                    required={i === 0 && !causaExistente}
                  />
                  <Input
                    placeholder="Apellido"
                    value={v.apellido}
                    onChange={(e) => handlePersonaChange('victimas', i, 'apellido', e.target.value)}
                    className={`rounded-xl h-11 text-gray-700 flex-1 border-gray-200 ${causaExistente
                      ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                      : 'bg-gray-50'
                      }`}
                    readOnly={!!causaExistente}
                  />
                  {i > 0 && !causaExistente && (
                    <button type="button" onClick={() => removePersona('victimas', i)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {!causaExistente && (
                <button type="button" onClick={() => addPersona('victimas')} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Agregar víctima
                </button>
              )}
            </div>

            {/* Imputados */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-[#1f3e97]">Imputado/s {!causaExistente && '*'}</Label>
              {formData.imputados.map((imp, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nombre"
                    value={imp.nombre}
                    onChange={(e) => handlePersonaChange('imputados', i, 'nombre', e.target.value)}
                    className={`rounded-xl h-11 text-gray-700 flex-1 border-gray-200 ${causaExistente
                      ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                      : 'bg-gray-50'
                      }`}
                    readOnly={!!causaExistente}
                    required={i === 0 && !causaExistente}
                  />
                  <Input
                    placeholder="Apellido"
                    value={imp.apellido}
                    onChange={(e) => handlePersonaChange('imputados', i, 'apellido', e.target.value)}
                    className={`rounded-xl h-11 text-gray-700 flex-1 border-gray-200 ${causaExistente
                      ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                      : 'bg-gray-50'
                      }`}
                    readOnly={!!causaExistente}
                  />
                  {i > 0 && !causaExistente && (
                    <button type="button" onClick={() => removePersona('imputados', i)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {!causaExistente && (
                <button type="button" onClick={() => addPersona('imputados')} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Agregar imputado
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Sección: Dispositivos Secuestrados ──────────────────────────── */}
        <section>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide border-b border-blue-100 pb-2 flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Dispositivos Secuestrados
          </h3>

          <div className="space-y-4">
            {formData.dispositivos.map((disp, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end bg-gray-50 border border-gray-200 rounded-xl p-4 relative"
              >
                {/* Badge */}
                <span className="absolute -top-3 left-4 bg-[#1f3e97] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  #{i + 1}
                </span>

                {/* Tipo de dispositivo */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1f3e97]">Tipo de Dispositivo *</Label>
                  <div className="relative">
                    {loadingPL ? (
                      <div className="h-11 flex items-center px-4 bg-white border border-gray-200 rounded-xl text-gray-400 text-sm gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <select
                          value={disp.idtipodispositivo}
                          onChange={(e) => handleDispositivoChange(i, 'idtipodispositivo', e.target.value)}
                          className="w-full h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1f3e97]/30 focus:border-[#1f3e97] transition-all"
                        >
                          <option value="">— Seleccionar —</option>
                          {tiposDisp.map((t) => (
                            <option key={t.idtipodispositivo} value={t.idtipodispositivo}>
                              {t.descripciontipo}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Marca */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1f3e97]">Marca</Label>
                  <Input
                    placeholder="Ej: Samsung, Apple..."
                    value={disp.marca}
                    onChange={(e) => handleDispositivoChange(i, 'marca', e.target.value)}
                    className="bg-white border-gray-200 rounded-xl h-11 text-gray-700"
                  />
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1f3e97]">Ubicación Actual</Label>
                  <Input
                    placeholder="Ej: Fiscalía N° 3, depósito..."
                    value={disp.ubicacionfisica}
                    onChange={(e) => handleDispositivoChange(i, 'ubicacionfisica', e.target.value)}
                    className="bg-white border-gray-200 rounded-xl h-11 text-gray-700"
                  />
                </div>

                {/* Propietario */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1f3e97]">Propietario</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Nombre del propietario..."
                      value={disp.propietario}
                      onChange={(e) => handleDispositivoChange(i, 'propietario', e.target.value)}
                      className="bg-white border-gray-200 rounded-xl h-11 text-gray-700 flex-1"
                    />
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDispositivo(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                        title="Eliminar dispositivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addDispositivo}
              className="flex items-center gap-2 text-sm font-semibold text-[#1f3e97] hover:text-blue-800 transition-colors border border-dashed border-[#1f3e97]/40 hover:border-[#1f3e97] rounded-xl px-4 py-3 w-full justify-center"
            >
              <PlusCircle className="w-4 h-4" /> Agregar dispositivo
            </button>
          </div>
        </section>

        {/* ── Botones ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-12 px-10 text-sm font-semibold tracking-wide disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
