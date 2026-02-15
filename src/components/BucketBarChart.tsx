import { formatCurrency } from '../utils/formatting';

interface BarData {
  bucket: number;
  label: string;
  value: number;
}

interface BucketBarChartProps {
  data: BarData[];
  color: 'blue' | 'purple' | 'amber';
  title: string;
  totalCharge: number;
}

const BAR_COLORS = {
  blue: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
  amber: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700' },
};

export default function BucketBarChart({ data, color, title, totalCharge }: BucketBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1e-10);
  const colors = BAR_COLORS[color];

  return (
    <div>
      <h4 className={`text-sm font-semibold ${colors.text} mb-2`}>{title}</h4>
      <div className="space-y-1">
        {data.map((d) => {
          const pct = d.value > 0 ? (d.value / maxValue) * 100 : 0;
          const contribution = totalCharge > 0 ? (d.value / totalCharge) * 100 : 0;
          const isEmpty = d.value === 0;
          return (
            <div key={d.bucket} className="flex items-center gap-2 text-xs">
              <span className="w-5 text-right font-medium text-gray-500">{d.bucket}</span>
              <span className="w-36 truncate text-gray-600" title={d.label}>{d.label}</span>
              <div className={`flex-1 ${colors.light} rounded-sm h-5 relative overflow-hidden`}>
                {isEmpty ? (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-gray-300 rounded-sm" />
                ) : (
                  <div
                    className={`${colors.bg} h-full rounded-sm transition-all duration-300`}
                    style={{ width: `${pct}%`, minWidth: '2px' }}
                  />
                )}
              </div>
              <span className="w-20 text-right font-mono text-gray-700">
                {formatCurrency(d.value)}
              </span>
              <span className="w-12 text-right text-gray-400">
                {isEmpty ? '—' : `${contribution.toFixed(1)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
