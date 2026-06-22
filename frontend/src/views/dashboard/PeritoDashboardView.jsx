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
import { Search, Flag, Pencil } from 'lucide-react';
import { apiClient } from '@/api/client';

export default function PeritoDashboardView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [oficios, setOficios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // const response = await apiClient.get('/perito/oficios');
      // setOficios(response.data);

      setOficios([
        {
          id: 1,
          interno: '433/25',
          legajo: '4868/2026',
          caratula: 'Gómez s/ Robo Calificado',
          fechaEstimada: '05/06/26',
          estado: 'En Proceso',
          urgente: true,
          dispositivos: ['Celular Samsung - Bloqueado', 'Laptop Lenovo - Bloqueado']
        },
        {
          id: 2,
          interno: '432/25',
          legajo: '5263/2026',
          caratula: 'López s/ Abuso Sexual',
          fechaEstimada: '-',
          estado: 'En Proceso',
          urgente: false,
          dispositivos: []
        }
      ]);
    } catch (error) {
      console.error('Error fetching oficios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1f3e97] mb-8">
        Bienvenida, Lic. Valdéz
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
              <TableRow key={item.id} className="border-b border-gray-300/30 hover:bg-white/10 transition-colors align-top">
                <TableCell className="pt-4">
                  <Flag className={`w-5 h-5 ${item.urgente ? 'text-red-500 fill-red-500' : 'text-[#1f3e97]'}`} />
                </TableCell>
                <TableCell className="pt-4">
                  <div className="font-bold text-gray-900">{item.interno}</div>
                  {item.dispositivos.length > 0 ? (
                    <>
                      <div className="mt-2 text-xs text-gray-600 flex items-center gap-1 cursor-pointer">
                        <span className="text-[10px]">👁</span> Ocultar Dispositivos
                      </div>
                      <div className="ml-4 mt-1">
                        {item.dispositivos.map((disp, i) => (
                          <div key={i} className="text-xs text-gray-800 font-semibold">{disp}</div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 cursor-pointer">
                      <span className="text-[10px]">👁</span> Mostrar Dispositivos
                    </div>
                  )}
                </TableCell>
                <TableCell className="pt-4 font-bold text-gray-900">{item.legajo}</TableCell>
                <TableCell className="pt-4 font-bold text-gray-900">{item.caratula}</TableCell>
                <TableCell className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-2 font-bold text-gray-900">
                    {item.fechaEstimada} <Pencil className="w-4 h-4 text-[#1f3e97] cursor-pointer" />
                  </div>
                </TableCell>
                <TableCell className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="bg-[#d4e157] text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                      {item.estado}
                    </span>
                    <Pencil className="w-4 h-4 text-[#1f3e97] cursor-pointer" />
                  </div>
                </TableCell>
                <TableCell className="pt-4 text-right">
                  <Button size="sm" className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-6 text-xs font-bold">
                    Abrir Oficio
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
