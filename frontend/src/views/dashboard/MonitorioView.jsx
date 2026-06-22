import { useState } from 'react';
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
import { Search } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useEffect } from 'react';

export default function MonitorioView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await apiClient.get('/oficios');
        // setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)]">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1f3e97] mb-6">
        Tabla de Monitorio General
      </h1>

      {/* Top Search and Checkboxes */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Legajo, Número Interno, Víctima, Imputado..." 
            className="pl-10 bg-gray-50 border-gray-200 rounded-full h-12 text-base text-gray-700" 
          />
        </div>
        <div className="flex items-center gap-6">
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

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">Filtrar por Perito a Cargo:</Label>
          <Select>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="perito1">Perito 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">Filtrar por Circunscripción:</Label>
          <Select>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="capital">Capital</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">Filtrar por Tipo de Delito:</Label>
          <Select>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="robo">Robo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">Filtrar por Estado de Oficio:</Label>
          <Select>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty Data Area Simulation */}
      <div className="flex-1 w-full bg-transparent min-h-[300px]">
        {/* Table would go here. In the mockup it's blank white space */}
      </div>

      {/* Bottom Button */}
      <div className="mt-8 pb-8">
        <Button 
          className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-12 px-8 text-sm font-semibold tracking-wide shadow-md"
        >
          GENERAR INFORME
        </Button>
      </div>
    </div>
  );
}
