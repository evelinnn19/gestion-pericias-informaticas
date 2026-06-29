import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart2, Activity } from 'lucide-react';
import { toast } from 'sonner';

import { apiClient } from '@/api/client';
import FiltrosEstadisticas from '@/components/estadisticas/FiltrosEstadisticas';
import MetricasResumen from '@/components/estadisticas/MetricasResumen';
import GraficoDelitos from '@/components/estadisticas/GraficoDelitos';
import GraficoDispositivos from '@/components/estadisticas/GraficoDispositivos';

export default function EstadisticaView() {
  // ── Estado de carga ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);

  // ── Datos del backend ───────────────────────────────────────────────────────
  const [causas, setCausas] = useState([]);
  const [delitos, setDelitos] = useState([]);
  const [oficios, setOficios] = useState([]);
  const [oficioDispositivos, setOficioDispositivos] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [tiposDispositivos, setTiposDispositivos] = useState([]);

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroDelito, setFiltroDelito] = useState('todos');
  const [filtroDispositivo, setFiltroDispositivo] = useState('todos');

  // ── Fetch de datos ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        resCausas, resDelitos, resOficios,
        resOfiDispositivos, resDispositivos, resTiposDisp,
      ] = await Promise.all([
        apiClient.get('/causa'),
        apiClient.get('/picklists/tipodelito'),
        apiClient.get('/oficio'),
        apiClient.get('/oficiodispositivo'),
        apiClient.get('/dispositivo'),
        apiClient.get('/picklists/tipodispositivo'),
      ]);

      setCausas(resCausas.data || []);
      setDelitos(resDelitos.data || []);
      setOficios(resOficios.data || []);
      setOficioDispositivos(resOfiDispositivos.data || []);
      setDispositivos(resDispositivos.data || []);
      setTiposDispositivos(resTiposDisp.data || []);
    } catch (error) {
      toast.error('Error al cargar datos estadísticos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Limpiar filtros ─────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setFechaInicio('');
    setFechaFin('');
    setFiltroDelito('todos');
    setFiltroDispositivo('todos');
  }, []);

  // ── Procesamiento de estadísticas ───────────────────────────────────────────
  const estadisticas = useMemo(() => {
    // 1. Filtrar causas por fecha y tipo de delito
    let causasFiltradas = causas;

    if (fechaInicio) {
      causasFiltradas = causasFiltradas.filter(
        (c) => new Date(c.fechaingreso) >= new Date(fechaInicio)
      );
    }
    if (fechaFin) {
      causasFiltradas = causasFiltradas.filter(
        (c) => new Date(c.fechaingreso) <= new Date(fechaFin + 'T23:59:59')
      );
    }
    if (filtroDelito !== 'todos') {
      causasFiltradas = causasFiltradas.filter(
        (c) => String(c.iddelito) === filtroDelito
      );
    }

    const causasIds = new Set(causasFiltradas.map((c) => c.idcausa));

    // 2. Oficios vinculados a las causas filtradas
    const oficiosFiltrados = oficios.filter((o) => causasIds.has(o.idcausa));
    const oficiosIds = new Set(oficiosFiltrados.map((o) => o.idoficio));

    // 3. Dispositivos relacionados a esos oficios
    const ofiDispRel = oficioDispositivos.filter((od) => oficiosIds.has(od.idoficio));
    const dispIds = new Set(ofiDispRel.map((od) => od.iddispositivo));

    let dispositivosFiltrados = dispositivos.filter((d) => dispIds.has(d.iddispositivo));

    // 4. Filtro adicional por tipo de dispositivo
    if (filtroDispositivo !== 'todos') {
      dispositivosFiltrados = dispositivosFiltrados.filter(
        (d) => String(d.idtipodispositivo) === filtroDispositivo
      );
    }

    // ── Conteo por tipo de delito ────────────────────────────────────────────
    const countDelitos = {};
    causasFiltradas.forEach((c) => {
      const tipo = delitos.find((d) => d.iddelito === c.iddelito)?.descripcion || 'Desconocido';
      countDelitos[tipo] = (countDelitos[tipo] || 0) + 1;
    });

    const topDelitos = Object.entries(countDelitos)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxDelitoCount = Math.max(...topDelitos.map((d) => d.count), 1);

    // ── Conteo por tipo de dispositivo ───────────────────────────────────────
    const countDispositivos = {};
    dispositivosFiltrados.forEach((d) => {
      const tipo =
        tiposDispositivos.find((td) => td.idtipodispositivo === d.idtipodispositivo)
          ?.descripciontipo || 'Desconocido';
      countDispositivos[tipo] = (countDispositivos[tipo] || 0) + 1;
    });

    const topDispositivos = Object.entries(countDispositivos)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxDispositivoCount = Math.max(...topDispositivos.map((d) => d.count), 1);

    return {
      totalCausas: causasFiltradas.length,
      totalDispositivos: dispositivosFiltrados.length,
      totalOficios: oficiosFiltrados.length,
      topDelitos,
      topDispositivos,
      maxDelitoCount,
      maxDispositivoCount,
    };
  }, [
    causas, delitos, oficios, oficioDispositivos,
    dispositivos, tiposDispositivos,
    fechaInicio, fechaFin, filtroDelito, filtroDispositivo,
  ]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 gap-2">
        <Activity className="w-6 h-6 animate-spin" />
        <span>Cargando estadísticas...</span>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Estadísticas</h2>
          <p className="text-sm text-gray-500">
            Métricas y análisis de delitos y dispositivos involucrados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosEstadisticas
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        filtroDelito={filtroDelito}
        setFiltroDelito={setFiltroDelito}
        filtroDispositivo={filtroDispositivo}
        setFiltroDispositivo={setFiltroDispositivo}
        delitos={delitos}
        tiposDispositivos={tiposDispositivos}
        onReset={handleReset}
      />

      {/* Tarjetas de métricas */}
      <MetricasResumen
        totalCausas={estadisticas.totalCausas}
        totalDispositivos={estadisticas.totalDispositivos}
        totalOficios={estadisticas.totalOficios}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoDelitos
          topDelitos={estadisticas.topDelitos}
          maxDelitoCount={estadisticas.maxDelitoCount}
        />
        <GraficoDispositivos
          topDispositivos={estadisticas.topDispositivos}
          maxDispositivoCount={estadisticas.maxDispositivoCount}
          totalDispositivos={estadisticas.totalDispositivos}
        />
      </div>
    </div>
  );
}
