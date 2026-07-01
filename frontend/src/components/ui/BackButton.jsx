import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ className, ...props }) {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline" 
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 ${className || ''}`}
      {...props}
    >
      <ArrowLeft className="w-4 h-4" />
      Volver
    </Button>
  );
}
