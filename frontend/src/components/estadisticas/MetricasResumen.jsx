import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, HardDrive, FileText, TrendingUp } from 'lucide-react';

function MetricaCard({ icon: Icon, colorBg, colorText, label, value, trend }) {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 ${colorBg} rounded-2xl ${colorText} flex-shrink-0`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider leading-tight">
            {label}
          </p>
          <h3 className="text-4xl font-extrabold text-gray-900 mt-1 tabular-nums">{value}</h3>
          {trend != null && (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetricasResumen({ totalCausas, totalDispositivos, totalOficios }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricaCard
        icon={AlertCircle}
        colorBg="bg-red-100"
        colorText="text-red-600"
        label="Causas Procesadas"
        value={totalCausas}
      />
      <MetricaCard
        icon={HardDrive}
        colorBg="bg-purple-100"
        colorText="text-purple-600"
        label="Dispositivos Involucrados"
        value={totalDispositivos}
      />
      <MetricaCard
        icon={FileText}
        colorBg="bg-blue-100"
        colorText="text-blue-600"
        label="Oficios Vinculados"
        value={totalOficios}
      />
    </div>
  );
}
