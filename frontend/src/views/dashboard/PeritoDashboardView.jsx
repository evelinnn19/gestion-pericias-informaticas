import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Search, Flag } from 'lucide-react';
import { apiClient } from '@/api/client';
import CalendarioGlobal, { useCalendarioData } from '@/components/ui/CalendarioGlobal';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PeritoDashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const peritoId = user?.idusuario || user?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [oficios, setOficios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadosCausa, setEstadosCausa] = useState([]);

  const calendarData = useCalendarioData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Cargar picklist de estados para la edición in-line
        const estadosRes = await apiClient.get('/picklists/estadocausa');
        setEstadosCausa(estadosRes.data || []);

        // Filtrado contextual: por defecto solo oficios del usuario logueado
        const params = {};
        if (peritoId) {
          params.idperito = peritoId;
        }
        
        const response = await apiClient.get('/oficio/listado', { params });

        let data = response.data || [];
        
        // Ordenamiento: de mayor a menor prioridad antes de renderizar
        data.sort((a, b) => {
          const priA = a.prioridad === 'Alta' ? 1 : 0;
          const priB = b.prioridad === 'Alta' ? 1 : 0;
          return priB - priA;
        });

        setOficios(data);
      } catch (error) {
        console.error('Error fetching oficios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [peritoId]);

  // Acciones de Perito
  const handleTogglePrioridad = (idoficio) => {
    setOficios(prev => {
      const updated = prev.map(o => {
        if (o.idoficio === idoficio) {
          return { ...o, prioridad: o.prioridad === 'Alta' ? 'Normal' : 'Alta' };
        }
        return o;
      });
      // Re-ordenar tras cambiar prioridad
      return updated.sort((a, b) => {
        const priA = a.prioridad === 'Alta' ? 1 : 0;
        const priB = b.prioridad === 'Alta' ? 1 : 0;
        return priB - priA;
      });
    });
  };

  const handleUpdateFecha = (idoficio, dateStr) => {
    setOficios(prev => prev.map(o => o.idoficio === idoficio ? { ...o, fechaentregaestimada: dateStr } : o));
  };

  const handleUpdateEstado = (idoficio, newEstadoId) => {
    const estadoObj = estadosCausa.find(e => String(e.idestadocausa) === newEstadoId);
    setOficios(prev => prev.map(o => {
      if (o.idoficio === idoficio) {
        return {
          ...o,
          causa: { ...o.causa, idestadocausa: parseInt(newEstadoId), estadocausa: estadoObj }
        };
      }
      return o;
    }));
  };

  const handleAbrirOficio = (idoficio) => {
    navigate(`/carga-oficio?id=${idoficio}`);
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1f3e97] mb-8">
        Bienvenido perito {user?.nombre || ''}
      </h1>

      {/* Top Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Número de Legajo, Número Interno, Víctima, Imputado..."
            className="pl-10 bg-gray-50 border-gray-200 rounded-full h-12 text-base text-gray-700 w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <Label className="text-sm font-semibold text-gray-900 whitespace-nowrap">Filtrar por Estado:</Label>
          <Select>
            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="en-proceso">En Proceso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6 ml-auto">
          <div className="flex items-center space-x-2">
            <Checkbox id="delitos-generales" className="border-[#1f3e97] data-[state=checked]:bg-[#1f3e97] data-[state=checked]:text-white" />
            <Label htmlFor="delitos-generales" className="text-sm font-semibold text-[#1f3e97]">
              Delitos Generales
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="delitos-narcomenudeo" className="border-[#1f3e97] data-[state=checked]:bg-[#1f3e97] data-[state=checked]:text-white" />
            <Label htmlFor="delitos-narcomenudeo" className="text-sm font-semibold text-[#1f3e97]">
              Delitos de Narcomenudeo
            </Label>
          </div>
        </div>
      </div>

      {/* Main Content: Table + Calendar */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Table Area */}
        <div className="flex-1 w-full bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm min-h-[300px]">
          <Table>
            <TableHeader className="border-b border-gray-300/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-gray-800 w-12"></TableHead>
                <TableHead className="font-bold text-gray-800">N° Interno</TableHead>
                <TableHead className="font-bold text-gray-800">N° Legajo</TableHead>
                <TableHead className="font-bold text-gray-800">Carátula</TableHead>
                <TableHead className="font-bold text-gray-800 text-center">Fecha de Entrega Estimada</TableHead>
                <TableHead className="font-bold text-gray-800 text-center">Estado</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oficios.map((item) => (
                <TableRow key={item.idoficio} className="border-b border-gray-300/30 hover:bg-white/10 transition-colors align-top">
                  <TableCell className="pt-4 text-center">
                    <Flag 
                      onClick={() => handleTogglePrioridad(item.idoficio)}
                      className={`w-5 h-5 mx-auto cursor-pointer transition-colors ${item.prioridad === 'Alta' ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-gray-600'}`} 
                    />
                  </TableCell>
                  <TableCell className="pt-4">
                    <div className="font-bold text-gray-900 text-xs">{item.nrointerno || '—'}</div>
                  </TableCell>
                  <TableCell className="pt-4 font-bold text-gray-900 text-xs">{item.causa?.nrolegajo || '—'}</TableCell>
                  <TableCell className="pt-4 font-bold text-gray-900 text-xs">{item.causa?.caratula || '—'}</TableCell>
                  <TableCell className="pt-4 text-center">
                    <Input 
                      type="date"
                      className="h-8 text-xs px-2 border-gray-300 bg-white/60 mx-auto max-w-[140px]"
                      value={item.fechaentregaestimada?.split('T')[0] || ''}
                      onChange={(e) => handleUpdateFecha(item.idoficio, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="pt-4 text-center">
                    <Select
                      value={String(item.causa?.idestadocausa || '')}
                      onValueChange={(val) => handleUpdateEstado(item.idoficio, val)}
                    >
                      <SelectTrigger className="h-8 text-[11px] bg-white border-gray-300 w-full font-semibold">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estadosCausa.map(e => (
                          <SelectItem key={e.idestadocausa} value={String(e.idestadocausa)}>
                            {e.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="pt-4 text-right">
                    <Button 
                      size="sm" 
                      onClick={() => handleAbrirOficio(item.idoficio)}
                      className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-6 text-xs font-bold"
                    >
                      Abrir Oficio
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Calendario */}
        <CalendarioGlobal {...calendarData} />
      </div>

      {/* Bottom Button */}
      <div className="mt-10 pb-8 flex justify-start">
        <Button
          className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-14 px-8 text-sm font-bold tracking-wide shadow-md"
        >
          GENERAR ACTA DE APERTURA
        </Button>
      </div>
    </div>
  );
}
