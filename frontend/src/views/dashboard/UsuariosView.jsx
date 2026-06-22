import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Search } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useEffect } from 'react';

export default function UsuariosView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await apiClient.get('/usuarios');
        // setUsersData(response.data);
        
        // Mock data
        setUsersData([
          {
            dni: '12345678',
            name: 'María de los Ángeles Valdez',
            email: 'mariangelesv@gmail.com',
            role: 'Perito'
          }
        ]);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)]">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1f3e97] mb-6">
        Gestión de Usuarios y Roles
      </h1>

      {/* Top Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
        <div className="relative flex-1 max-w-3xl">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nombre, Apellido , DNI..." 
            className="pl-10 bg-gray-50 border-gray-200 rounded-full h-12 text-base text-gray-700 w-full" 
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Label className="text-sm font-semibold text-gray-900 whitespace-nowrap">Filtrar por Rol:</Label>
          <Select>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-50 border-gray-200 rounded-full h-10 text-gray-700">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="administrador">Administrador</SelectItem>
              <SelectItem value="perito">Perito</SelectItem>
              <SelectItem value="coordinador">Coordinador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 w-full bg-[#d0d7e8] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-auto h-full max-h-[500px]">
          <Table>
            <TableHeader className="border-b border-gray-300/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-gray-800 w-[120px]">DNI</TableHead>
                <TableHead className="font-bold text-gray-800">Nombre y Apellido</TableHead>
                <TableHead className="font-bold text-gray-800">Correo</TableHead>
                <TableHead className="font-bold text-gray-800 w-[150px]">Rol</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user, index) => (
                <TableRow key={index} className="border-b border-gray-300/30 hover:bg-white/10 transition-colors">
                  <TableCell className="font-medium text-gray-900">{user.dni}</TableCell>
                  <TableCell className="text-gray-900 font-semibold">{user.name}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{user.email}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{user.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs">
                        Modificar Campos
                      </Button>
                      <Button size="sm" className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-8 px-4 text-xs">
                        Dar de Baja
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-6 pb-8">
        <Button 
          className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-xl h-12 px-8 text-sm font-semibold tracking-wide shadow-md"
        >
          NUEVO USUARIO
        </Button>
      </div>
    </div>
  );
}
