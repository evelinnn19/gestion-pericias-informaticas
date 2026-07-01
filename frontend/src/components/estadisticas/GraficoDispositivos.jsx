import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Pie/donut chart built purely with SVG — no external library
const PIE_COLORS = [
  '#8b5cf6', // violet-500
  '#a78bfa', // violet-400
  '#c4b5fd', // violet-300
  '#7c3aed', // violet-700
  '#5b21b6', // violet-900
];

function PieChart({ data, total }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  const cx = 110;
  const cy = 110;
  const outerR = 90;
  const innerR = 52;

  let cumAngle = -Math.PI / 2;
  const arcs = data.map((item, idx) => {
    const rawFraction = item.count / total;
    // Si la fracción es exactamente 1 (100%), el arco de SVG se cierra sobre sí mismo y no se dibuja.
    // Usamos 0.9999 para obligar a que dibuje el círculo (casi) completo.
    const fraction = rawFraction === 1 ? 0.9999 : rawFraction;

    const startAngle = cumAngle;
    const endAngle = cumAngle + fraction * 2 * Math.PI;
    cumAngle = endAngle;

    const r = hoveredIdx === idx ? outerR + 8 : outerR;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);

    // Ajuste: Usamos >= 0.5 para que el arco cubra bien la mitad exacta
    const largeArc = fraction >= 0.5 ? 1 : 0;

    const d = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    // Ajuste: Movemos la etiqueta un poco más hacia afuera (divisor 1.6 en lugar de 2)
    const midAngle = startAngle + (fraction * Math.PI);
    const labelR = (outerR + innerR) / 1.6;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { d, color: PIE_COLORS[idx % PIE_COLORS.length], fraction, item, lx, ly, idx };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <svg
        viewBox="0 0 220 220"
        className="w-full max-w-[200px] h-auto aspect-square flex-shrink-0 drop-shadow-sm"
      >
        {arcs.map((arc) => (
          <g key={arc.idx}>
            <path
              d={arc.d}
              fill={arc.color}
              opacity={hoveredIdx === null || hoveredIdx === arc.idx ? 1 : 0.55}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredIdx(arc.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {arc.fraction > 0.08 && ( // Ajuste leve: umbral un poco más flexible
              <text
                x={arc.lx}
                y={arc.ly + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="15"
                fontWeight="bold"
                fill="black"
              >
                {Math.round(arc.fraction * 100)}%
              </text>
            )}
          </g>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af" className="font-medium tracking-wider">
          DISPOSITIVOS
        </text>
      </svg>

      {/* Legend */}
      <ul className="space-y-3 flex-1 min-w-0 w-full">
        {arcs.map((arc) => (
          <li
            key={arc.idx}
            className={`flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2 transition-colors ${hoveredIdx === arc.idx ? 'bg-gray-50' : ''
              }`}
            onMouseEnter={() => setHoveredIdx(arc.idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: arc.color }}
            />
            <span className="text-sm font-medium text-gray-700 truncate flex-1">{arc.item.name}</span>
            <span
              className="text-sm font-bold flex-shrink-0 px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: arc.color + '20', color: arc.color }}
            >
              {arc.item.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GraficoDispositivos({ topDispositivos, maxDispositivoCount, totalDispositivos }) {
  const hasData = topDispositivos && topDispositivos.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-6 border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Tipos de dispositivos
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Proporción por tipo — {totalDispositivos} dispositivos totales
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {hasData ? (
          <div className="space-y-8">
            {/* Pie chart */}
            <PieChart data={topDispositivos} total={totalDispositivos} />

            {/* Progress bars for comparison */}
            <div className="space-y-5 pt-6 border-t border-gray-100">
              {topDispositivos.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-base font-medium mb-1.5">
                      <span className="text-gray-700 truncate pr-2">{item.name}</span>
                      <span
                        className="text-sm font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] + '20',
                          color: PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${(item.count / maxDispositivoCount) * 100}%`,
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],

                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 010 20" />
            </svg>
            <p className="text-base">Sin datos para los filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}