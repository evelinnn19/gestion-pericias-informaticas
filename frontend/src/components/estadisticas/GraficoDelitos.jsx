import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// SVG bar chart — completely self-contained, no external library
const CHART_W = 480;
const CHART_H = 200;
const PADDING = { top: 16, right: 16, bottom: 48, left: 40 };

const COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
];

function BarChart({ data, maxValue, color }) {
  if (!data || data.length === 0) return null;

  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = CHART_H - PADDING.top - PADDING.bottom;
  const barCount = data.length;
  const barGap = 12;
  const barW = Math.min(60, (plotW - barGap * (barCount - 1)) / barCount);
  const groupW = barW * barCount + barGap * (barCount - 1);
  const startX = PADDING.left + (plotW - groupW) / 2;

  const yScale = (val) => plotH - (val / maxValue) * plotH;

  // Gridlines
  const ticks = 4;
  const gridLines = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((maxValue / ticks) * i)
  );

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-auto overflow-visible"
      aria-label="Gráfico de barras"
    >
      {/* Grid lines */}
      {gridLines.map((tick, i) => {
        const y = PADDING.top + yScale(tick);
        return (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={CHART_W - PADDING.right}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray={tick === 0 ? '0' : '4,3'}
            />
            <text x={PADDING.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {tick}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((item, idx) => {
        const x = startX + idx * (barW + barGap);
        const barH = (item.count / maxValue) * plotH;
        const barY = PADDING.top + plotH - barH;
        const barColor = color || COLORS[idx % COLORS.length];
        const maxLabelLen = 10;
        const label =
          item.name.length > maxLabelLen
            ? item.name.slice(0, maxLabelLen) + '…'
            : item.name;

        return (
          <g key={idx}>
            {/* Bar shadow */}
            <rect
              x={x + 2}
              y={barY + 3}
              width={barW}
              height={barH}
              rx="5"
              fill="rgba(0,0,0,0.06)"
            />
            {/* Bar */}
            <rect
              x={x}
              y={barY}
              width={barW}
              height={barH}
              rx="5"
              fill={barColor}
              opacity="0.9"
            />
            {/* Value label on top */}
            <text
              x={x + barW / 2}
              y={barY - 5}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={barColor}
            >
              {item.count}
            </text>
            {/* X label */}
            <text
              x={x + barW / 2}
              y={PADDING.top + plotH + 16}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function GraficoDelitos({ topDelitos, maxDelitoCount }) {
  const hasData = topDelitos && topDelitos.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-6 border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Delitos más frecuentes
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Top {Math.min(topDelitos?.length ?? 0, 5)} — por cantidad de causas
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {hasData ? (
          <div className="space-y-8">
            {/* Bar chart */}
            <BarChart data={topDelitos} maxValue={maxDelitoCount} />

            {/* Detailed ranking list */}
            <div className="space-y-5 pt-6 border-t border-gray-100">
              {topDelitos.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-base font-medium mb-1.5">
                      <span className="text-gray-700 truncate pr-2">{item.name}</span>
                      <span
                        className="text-sm font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length] + '20',
                          color: COLORS[idx % COLORS.length],
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${(item.count / maxDelitoCount) * 100}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-base">Sin datos para los filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}