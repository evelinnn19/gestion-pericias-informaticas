import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart2, Activity, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { apiClient } from '@/api/client';
import FiltrosEstadisticas from '@/components/estadisticas/FiltrosEstadisticas';
import MetricasResumen from '@/components/estadisticas/MetricasResumen';
import GraficoDelitos from '@/components/estadisticas/GraficoDelitos';
import GraficoDispositivos from '@/components/estadisticas/GraficoDispositivos';
import { BackButton } from '@/components/ui/BackButton';

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

    // Bug #3 fix: comparación lexicográfica de 'YYYY-MM-DD' — elimina ambigüedad
    // de zonas horarias que ocurría al usar `new Date()` con strings de solo fecha.
    const dateOf = (iso) => (iso || '').slice(0, 10);

    if (fechaInicio) {
      causasFiltradas = causasFiltradas.filter(
        (c) => dateOf(c.fechaingreso) >= fechaInicio
      );
    }
    if (fechaFin) {
      causasFiltradas = causasFiltradas.filter(
        (c) => dateOf(c.fechaingreso) <= fechaFin
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
      // Bug #1 fix: normalizar ambos lados a String() para evitar number !== string
      // cuando la API devuelve IDs como strings en lugar de números.
      const tipo =
        delitos.find((d) => String(d.iddelito) === String(c.iddelito))?.descripcion ||
        'Desconocido';
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
      // Bug #2 fix: normalizar ambos lados a String() — mismo problema que Bug #1.
      const tipo =
        tiposDispositivos.find(
          (td) => String(td.idtipodispositivo) === String(d.idtipodispositivo)
        )?.descripciontipo || 'Desconocido';
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

  // ── Descargar PDF ───────────────────────────────────────────────────────────
  const handleDownloadPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Reporte de Estadísticas', 14, 22);
      
      // Filtros aplicados
      doc.setFontSize(11);
      doc.setTextColor(100);
      let filtrosTexto = [];
      if (fechaInicio || fechaFin) {
        filtrosTexto.push(`Fechas: ${fechaInicio || 'Inicio'} al ${fechaFin || 'Hoy'}`);
      }
      
      const nombreDelito = filtroDelito === 'todos' 
        ? 'Todos' 
        : delitos.find(d => String(d.iddelito) === filtroDelito)?.descripcion || filtroDelito;
      filtrosTexto.push(`Delito: ${nombreDelito}`);

      const nombreDispositivo = filtroDispositivo === 'todos'
        ? 'Todos'
        : tiposDispositivos.find(t => String(t.idtipodispositivo) === filtroDispositivo)?.descripciontipo || filtroDispositivo;
      filtrosTexto.push(`Dispositivo: ${nombreDispositivo}`);
      
      doc.text(filtrosTexto.join(' | '), 14, 30);
      
      // Resumen General
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Resumen General', 14, 42);
      
      autoTable(doc, {
        startY: 46,
        head: [['Causas', 'Oficios', 'Dispositivos']],
        body: [
          [estadisticas.totalCausas.toString(), estadisticas.totalOficios.toString(), estadisticas.totalDispositivos.toString()]
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Top 5 Delitos
      let finalY = doc.lastAutoTable.finalY || 46;
      doc.setFontSize(14);
      doc.text('Top 5 Tipos de Delitos', 14, finalY + 12);
      
      autoTable(doc, {
        startY: finalY + 16,
        head: [['Tipo de Delito', 'Cantidad']],
        body: estadisticas.topDelitos.map(d => [d.name, d.count.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [52, 73, 94] },
      });

      // Top 5 Dispositivos
      finalY = doc.lastAutoTable.finalY || finalY + 16;
      doc.setFontSize(14);
      doc.text('Top 5 Tipos de Dispositivos', 14, finalY + 12);
      
      autoTable(doc, {
        startY: finalY + 16,
        head: [['Tipo de Dispositivo', 'Cantidad']],
        body: estadisticas.topDispositivos.map(d => [d.name, d.count.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [52, 73, 94] },
      });

      doc.save('estadisticas_reporte.pdf');
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el PDF');
    }
  }, [estadisticas, fechaInicio, fechaFin, filtroDelito, filtroDispositivo, delitos, tiposDispositivos]);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
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
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Descargar PDF
        </button>
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
