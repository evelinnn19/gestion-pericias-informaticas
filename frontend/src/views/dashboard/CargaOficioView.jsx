import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, PlusCircle, ChevronDown } from 'lucide-react';
import { apiClient } from '@/api/client';

export default function CargaOficioView() {
  const [formData, setFormData] = useState({
    legajo: '',
    fiscal: '',
    fechaIngreso: '',
    victimas: [''],
    imputados: [''],
    tipoDelitos: [''],
    secuestros: [''],
    tareas: [''],
    peritos: [''],
    aperturaFecha: '',
    aperturaHora: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, field, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/oficios', formData);
      alert('Oficio cargado exitosamente');
      // Reset form or redirect
    } catch (error) {
      console.error('Error al cargar oficio:', error);
      alert('Hubo un error al cargar el oficio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#1f3e97] mb-8">
        Carga de Oficio – N° Interno 59/2026
      </h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#1f3e97]">Número de Legajo Causa*</Label>
            <Input 
              name="legajo" 
              value={formData.legajo} 
              onChange={handleChange} 
              className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#1f3e97]">Fiscal Solicitante*</Label>
            <Input 
              name="fiscal" 
              value={formData.fiscal} 
              onChange={handleChange} 
              className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700" 
              required
            />
          </div>
          <div className="space-y-2 relative">
            <Label className="text-base font-semibold text-[#1f3e97]">Fecha Ingreso*</Label>
            <div className="relative">
              <Input 
                name="fechaIngreso" 
                value={formData.fechaIngreso} 
                onChange={handleChange} 
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 pr-10" 
                required
              />
              <Calendar className="absolute right-3 top-3 w-5 h-5 text-[#1f3e97]" />
            </div>
          </div>
        </div>

        {/* AUTO Section */}
        <div>
          <h3 className="text-lg font-bold text-[#1f3e97] mb-4 uppercase tracking-wide">AUTO</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Víctima/s*</Label>
              {formData.victimas.map((item, index) => (
                <Input 
                  key={index}
                  value={item} 
                  onChange={(e) => handleArrayChange(index, 'victimas', e.target.value)} 
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 mb-2" 
                  required={index === 0}
                />
              ))}
              <button 
                type="button" 
                onClick={() => addArrayItem('victimas')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Agregar más víctimas
              </button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Imputado/s*</Label>
              {formData.imputados.map((item, index) => (
                <Input 
                  key={index}
                  value={item} 
                  onChange={(e) => handleArrayChange(index, 'imputados', e.target.value)} 
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 mb-2" 
                  required={index === 0}
                />
              ))}
              <button 
                type="button" 
                onClick={() => addArrayItem('imputados')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Agregar más imputados
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Tipo de Delito*</Label>
              {formData.tipoDelitos.map((item, index) => (
                <Input 
                  key={index}
                  value={item} 
                  onChange={(e) => handleArrayChange(index, 'tipoDelitos', e.target.value)} 
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 mb-2" 
                  required={index === 0}
                />
              ))}
              <button 
                type="button" 
                onClick={() => addArrayItem('tipoDelitos')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Agregar más delitos
              </button>
            </div>
          </div>
        </div>

        {/* Secuestro y Tareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#1f3e97]">Secuestro/s*</Label>
            {formData.secuestros.map((item, index) => (
                <Input 
                  key={index}
                  value={item} 
                  onChange={(e) => handleArrayChange(index, 'secuestros', e.target.value)} 
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 mb-2" 
                  required={index === 0}
                />
            ))}
            <button 
              type="button" 
              onClick={() => addArrayItem('secuestros')}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Agregar más secuestros
            </button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#1f3e97]">Tarea/s*</Label>
            {formData.tareas.map((item, index) => (
                <Input 
                  key={index}
                  value={item} 
                  onChange={(e) => handleArrayChange(index, 'tareas', e.target.value)} 
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 mb-2" 
                  required={index === 0}
                />
            ))}
            <button 
              type="button" 
              onClick={() => addArrayItem('tareas')}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Agregar más tareas
            </button>
          </div>
        </div>

        {/* Peritos */}
        <div className="space-y-2 max-w-sm">
          <Label className="text-base font-semibold text-[#1f3e97]">Perito Asignado</Label>
          {formData.peritos.map((item, index) => (
            <div key={index} className="relative mb-2">
              <Input 
                value={item} 
                onChange={(e) => handleArrayChange(index, 'peritos', e.target.value)} 
                className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 pr-10" 
              />
              {/* Note: This is an input but might be replaced by a Select in the future. Kept ChevronDown to match the mockup visual. */}
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addArrayItem('peritos')}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Agregar más peritos
          </button>
        </div>

        {/* Acto de Apertura Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-[#1f3e97] mb-6">Acto de Apertura</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Fecha</Label>
              <div className="relative">
                <Input 
                  name="aperturaFecha" 
                  value={formData.aperturaFecha} 
                  onChange={handleChange} 
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 pr-10" 
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-[#1f3e97]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1f3e97]">Hora</Label>
              <div className="relative">
                <Input 
                  name="aperturaHora" 
                  value={formData.aperturaHora} 
                  onChange={handleChange} 
                  className="bg-gray-50 border-gray-200 rounded-xl h-12 text-gray-700 pr-10" 
                />
                <Clock className="absolute right-3 top-3 w-5 h-5 text-[#1f3e97]" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-10">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-12 px-10 text-sm font-semibold tracking-wide disabled:opacity-50"
          >
            {loading ? 'CONFIRMANDO...' : 'CONFIRMAR'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            className="border-2 border-[#1f3e97] text-[#1f3e97] hover:bg-blue-50 rounded-full h-12 px-10 text-sm font-semibold tracking-wide"
          >
            CANCELAR
          </Button>
        </div>

      </form>
    </div>
  );
}
