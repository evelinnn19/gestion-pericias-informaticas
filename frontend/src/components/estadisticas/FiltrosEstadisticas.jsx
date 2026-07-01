import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar, RotateCcw } from 'lucide-react';

export default function FiltrosEstadisticas({
  fechaInicio, setFechaInicio,
  fechaFin, setFechaFin,
  filtroDelito, setFiltroDelito,
  filtroDispositivo, setFiltroDispositivo,
  delitos,
  tiposDispositivos,
  onReset,
}) {
  const hayFiltrosActivos =
    fechaInicio || fechaFin || filtroDelito !== 'todos' || filtroDispositivo !== 'todos';

  return (
    <Card className="border-t-4 border-t-blue-500 shadow-sm relative z-20">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            Filtros de Análisis
          </CardTitle>
          {hayFiltrosActivos && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-700">Fecha Inicio</Label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-gray-50 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Fecha Fin</Label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-gray-50 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Tipo de Delito</Label>
            <Select value={filtroDelito} onValueChange={setFiltroDelito}>
              <SelectTrigger className="bg-white h-11">
                <SelectValue placeholder="Todos los delitos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los delitos</SelectItem>
                {delitos.map((d) => (
                  <SelectItem key={d.iddelito} value={String(d.iddelito)}>
                    {d.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Tipo de Dispositivo</Label>
            <Select value={filtroDispositivo} onValueChange={setFiltroDispositivo}>
              <SelectTrigger className="bg-white h-11">
                <SelectValue placeholder="Todos los dispositivos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los dispositivos</SelectItem>
                {tiposDispositivos.map((td) => (
                  <SelectItem key={td.idtipodispositivo} value={String(td.idtipodispositivo)}>
                    {td.descripciontipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
