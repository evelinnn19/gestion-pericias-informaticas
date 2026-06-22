import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { apiClient } from '@/api/client';

export default function MesaEntradaDashboardView() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [pendientes, setPendientes] = useState([]);
  const [oficios, setOficios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Replace with actual endpoints
      // const resPendientes = await apiClient.get('/oficios/pendientes');
      // const resOficios = await apiClient.get('/oficios');
      // setPendientes(resPendientes.data);
      // setOficios(resOficios.data);
      
      // Mock data representing the real API response to show the UI
      setPendientes([
        { id: 1, interno: '59/2026', legajo: '2025/2025' }
      ]);
      setOficios([
        { 
          id: 1, 
          interno: '433/25', 
          legajo: '4868/2026', 
          perito: 'María de los Ángeles Valdez', 
          fecha: '05/05/26 08:50hs', 
          estado: 'En Proceso',
          dispositivos: ['Celular Samsung - Bloqueado', 'Laptop Lenovo - Bloqueado']
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
      
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Left Action Buttons */}
        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <Button 
            onClick={() => navigate('/carga-oficio')}
            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-14 text-sm font-bold tracking-wide shadow-md"
          >
            CARGAR NUEVO OFICIO
          </Button>
          <Button 
            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-14 text-sm font-bold tracking-wide shadow-md"
          >
            DEVOLUCIÓN DE DISPOSITIVO
          </Button>
          <Button 
            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-14 text-sm font-bold tracking-wide shadow-md"
          >
            GENERAR INFORME
          </Button>
        </div>

        {/* Right Pending Assignments */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#1f3e97] mb-4">Oficios Pendientes de Asignación</h2>
          <div className="bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm h-48 overflow-y-auto">
            <Table>
              <TableHeader className="border-b border-gray-300/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-800">N° Interno</TableHead>
                  <TableHead className="font-bold text-gray-800">N° Legajo</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendientes.map((item) => (
                  <TableRow key={item.id} className="border-b border-gray-300/30 hover:bg-white/10 transition-colors">
                    <TableCell className="font-medium text-gray-900">{item.interno}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{item.legajo}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs">
                        ASIGNAR PERITO Y FECHA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendientes.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                      No hay oficios pendientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Bottom Left: Monitor Table */}
        <div className="flex-1 flex flex-col">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Buscar por Legajo, Número Interno, Víctima, Imputado..." 
                className="pl-10 bg-gray-50 border-gray-200 rounded-full h-12 text-base text-gray-700 w-full" 
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

          <div className="bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm flex-1 min-h-[300px]">
            <Table>
              <TableHeader className="border-b border-gray-300/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-800">N° Interno</TableHead>
                  <TableHead className="font-bold text-gray-800">N° Legajo</TableHead>
                  <TableHead className="font-bold text-gray-800">Perito Responsable</TableHead>
                  <TableHead className="font-bold text-gray-800">Fecha y Hora de Apertura</TableHead>
                  <TableHead className="font-bold text-gray-800">Estado</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oficios.map((item) => (
                  <TableRow key={item.id} className="border-b border-gray-300/30 hover:bg-white/10 transition-colors align-top">
                    <TableCell>
                      <div className="font-medium text-gray-900">{item.interno}</div>
                      <div className="mt-2 text-xs text-gray-600 flex items-center gap-1 cursor-pointer">
                        <span className="text-[10px]">👁</span> Ocultar Dispositivos
                      </div>
                      <div className="ml-4 mt-1">
                        {item.dispositivos.map((disp, i) => (
                          <div key={i} className="text-xs text-gray-800 font-semibold">{disp}</div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 font-bold">{item.legajo}</TableCell>
                    <TableCell className="text-gray-900 font-bold">{item.perito}</TableCell>
                    <TableCell className="text-gray-900 font-bold">{item.fecha}</TableCell>
                    <TableCell>
                      <span className="bg-[#d4e157] text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                        {item.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs">
                          Ver Detalles
                        </Button>
                        <Button size="sm" className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs">
                          Reprogramar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Bottom Right: Calendar */}
        <div className="w-full lg:w-80 shrink-0">
          <h3 className="text-2xl font-bold text-[#1f3e97] mb-4 text-center">Calendario</h3>
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
