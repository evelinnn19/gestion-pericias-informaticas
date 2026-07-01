import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';
import ListadoOficiosReadOnly from '@/components/ui/ListadoOficiosReadOnly';
import CalendarioGlobal, { useCalendarioData } from '@/components/ui/CalendarioGlobal';

export default function MonitorioView() {
  const calendarData = useCalendarioData();

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)] gap-6">

      {/* Header row: title + Estadísticas button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1f3e97]">
          Tabla de Monitorio General
        </h1>
        <Button
          id="btn-estadisticas-coordinador"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 text-sm font-semibold shadow-md transition-colors self-start sm:self-auto"
        >
          <BarChart2 className="w-4 h-4" />
          Estadísticas
        </Button>
      </div>

      {/* Listado dinámico de oficios — componente compartido + Calendario */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <ListadoOficiosReadOnly />
        </div>
        <CalendarioGlobal {...calendarData} />
      </div>

      {/* Bottom Button — exclusivo del Coordinador */}
      <div className="pb-8">
        <Button
          id="btn-generar-informe"
          className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-12 px-8 text-sm font-semibold tracking-wide shadow-md"
        >
          GENERAR INFORME
        </Button>
      </div>
    </div>
  );
}
