import { useState, useEffect, useCallback } from 'react';
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
import { Search, Eye, Loader2, AlertCircle, FileText } from 'lucide-react';
import { apiClient } from '@/api/client';

/**
 * ListadoOficiosReadOnly
 * Componente compartido que muestra el listado de oficios en modo solo lectura.
 * Carga dinámicamente las opciones de filtros y los oficios desde la API.
 * Reutilizado por UsuariosView (Admin) y MonitorioView (Coordinador).
 */
export default function ListadoOficiosReadOnly() {
  // ── Estado de filtros ──────────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('');
  const [idperito, setIdperito] = useState('');
  const [iddelito, setIddelito] = useState('');
  const [idestadocausa, setIdestadocausa] = useState('');

  // ── Estado de opciones dinámicas ───────────────────────────────────────────
  const [peritos, setPeritos] = useState([]);
  const [tiposDelito, setTiposDelito] = useState([]);
  const [estadosCausa, setEstadosCausa] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errorOptions, setErrorOptions] = useState(null);

  // ── Estado de resultados ───────────────────────────────────────────────────
  const [oficios, setOficiosData] = useState([]);
  const [loadingOficios, setLoadingOficios] = useState(false);
  const [errorOficios, setErrorOficios] = useState(null);

  // ── Carga inicial de opciones de filtros ───────────────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      setErrorOptions(null);
      try {
        const [peritosRes, delitoRes, estadoRes] = await Promise.all([
          apiClient.get('/usuarios/peritos'),
          apiClient.get('/picklists/tipodelito'),
          apiClient.get('/picklists/estadocausa'),
        ]);
        setPeritos(peritosRes.data || []);
        setTiposDelito(delitoRes.data || []);
        setEstadosCausa(estadoRes.data || []);
      } catch (err) {
        console.error('[ListadoOficiosReadOnly] Error cargando opciones:', err);
        setErrorOptions('No se pudieron cargar las opciones de filtros.');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // ── Consulta de oficios con filtros activos ────────────────────────────────
  const fetchOficios = useCallback(async () => {
    setLoadingOficios(true);
    setErrorOficios(null);
    try {
      const params = {};
      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (idperito) params.idperito = idperito;
      if (iddelito) params.iddelito = iddelito;
      if (idestadocausa) params.idestadocausa = idestadocausa;

      const { data } = await apiClient.get('/oficio/listado', { params });
      setOficiosData(data || []);
    } catch (err) {
      console.error('[ListadoOficiosReadOnly] Error cargando oficios:', err);
      setErrorOficios('No se pudieron cargar los oficios.');
    } finally {
      setLoadingOficios(false);
    }
  }, [busqueda, idperito, iddelito, idestadocausa]);

  // Re-consultar cuando cambien los filtros de select (inmediato)
  useEffect(() => {
    fetchOficios();
  }, [idperito, iddelito, idestadocausa]);

  // Debounce para la búsqueda libre (espera 400ms tras el último teclazo)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOficios();
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const getPeritoNombres = (oficio) => {
    const peritos = oficio.oficio_perito;
    if (!peritos || peritos.length === 0) return '—';
    return peritos
      .map((op) => {
        const u = op.usuarios;
        return u ? `${u.apellido}, ${u.nombre}` : '—';
      })
      .join(' / ');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-6">

      {/* Badge solo lectura */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          <Eye className="w-3.5 h-3.5" />
          Solo lectura
        </span>
      </div>

      {/* Barra de búsqueda libre */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          id="listado-oficios-busqueda"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por N° Interno, Legajo, Carátula, Fiscal..."
          className="pl-10 bg-gray-50 border-gray-200 rounded-full h-12 text-base text-gray-700"
        />
      </div>

      {/* Filtros dinámicos */}
      {loadingOptions ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando opciones de filtros...
        </div>
      ) : errorOptions ? (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorOptions}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Filtro: Perito a cargo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Filtrar por Perito a Cargo:
            </Label>
            <Select
              value={idperito}
              onValueChange={(val) => setIdperito(val === 'todos' ? '' : val)}
            >
              <SelectTrigger
                id="listado-oficios-filtro-perito"
                className="w-full bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700"
              >
                <SelectValue placeholder="Todos los peritos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {peritos.map((p) => (
                  <SelectItem key={p.idusuario} value={String(p.idusuario)}>
                    {p.apellido}, {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro: Tipo de delito */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Filtrar por Tipo de Delito:
            </Label>
            <Select
              value={iddelito}
              onValueChange={(val) => setIddelito(val === 'todos' ? '' : val)}
            >
              <SelectTrigger
                id="listado-oficios-filtro-delito"
                className="w-full bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700"
              >
                <SelectValue placeholder="Todos los delitos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {tiposDelito.map((d) => (
                  <SelectItem key={d.iddelito} value={String(d.iddelito)}>
                    {d.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro: Estado de oficio (estadocausa) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Filtrar por Estado de Oficio:
            </Label>
            <Select
              value={idestadocausa}
              onValueChange={(val) => setIdestadocausa(val === 'todos' ? '' : val)}
            >
              <SelectTrigger
                id="listado-oficios-filtro-estado"
                className="w-full bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700"
              >
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {estadosCausa.map((e) => (
                  <SelectItem key={e.idestadocausa} value={String(e.idestadocausa)}>
                    {e.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Tabla de resultados */}
      <div className="w-full bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm">
        {loadingOficios ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#1f3e97]" />
            Cargando oficios...
          </div>
        ) : errorOficios ? (
          <div className="flex items-center justify-center gap-2 py-12 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errorOficios}
          </div>
        ) : oficios.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-sm italic">No se encontraron oficios con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[480px]">
            <Table>
              <TableHeader className="border-b border-gray-300/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-800 w-[120px]">N° Interno</TableHead>
                  <TableHead className="font-bold text-gray-800 w-[130px]">Legajo</TableHead>
                  <TableHead className="font-bold text-gray-800">Carátula</TableHead>
                  <TableHead className="font-bold text-gray-800">Delito</TableHead>
                  <TableHead className="font-bold text-gray-800">Estado</TableHead>
                  <TableHead className="font-bold text-gray-800">Perito/s</TableHead>
                  <TableHead className="font-bold text-gray-800 w-[110px]">Apertura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oficios.map((o) => (
                  <TableRow
                    key={o.idoficio}
                    className="border-b border-gray-300/30 hover:bg-white/20 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 text-xs">
                      {o.nrointerno}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs">
                      {o.causa?.nrolegajo ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-900 font-semibold text-xs max-w-[200px] truncate">
                      {o.causa?.caratula ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs">
                      {o.causa?.tipodelito?.descripcion ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="bg-white/60 text-gray-800 px-2 py-0.5 rounded-full font-medium text-[11px] border border-gray-300/40">
                        {o.causa?.estadocausa?.descripcion ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs">
                      {getPeritoNombres(o)}
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs">
                      {formatFecha(o.fechahoraapertura)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      {!loadingOficios && !errorOficios && (
        <p className="text-xs text-gray-500 text-right">
          {oficios.length === 0
            ? 'Sin resultados'
            : `Mostrando ${oficios.length} oficio${oficios.length !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  );
}
