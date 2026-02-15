import { formatPercent } from '../utils/formatting';

interface Props {
  matrix: number[][];
  labels: string[];
  title?: string;
  headerValues?: { label: string; value: number }[];
  compact?: boolean;
}

export default function CorrelationMatrix({ matrix, labels, title, headerValues, compact }: Props) {
  if (matrix.length === 0) {
    return <p className="text-gray-400 text-sm italic">No data for this bucket</p>;
  }

  const cellClass = compact
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2 py-1 text-sm';

  return (
    <div>
      {title && <h4 className="font-semibold text-sm mb-2">{title}</h4>}
      <div className="overflow-x-auto">
        <table className="border-collapse text-right">
          <thead>
            <tr>
              <th className={cellClass}></th>
              {labels.map((label, i) => (
                <th key={i} className={`${cellClass} font-medium text-gray-600 max-w-[100px] truncate`} title={label}>
                  {compact ? label.slice(0, 8) : label}
                </th>
              ))}
            </tr>
            {headerValues && (
              <tr className="bg-blue-50">
                <td className={`${cellClass} font-medium text-left text-gray-600`}>
                  {headerValues[0]?.label ?? ''}
                </td>
                {headerValues.map((hv, i) => (
                  <td key={i} className={`${cellClass} font-mono text-blue-700`}>
                    {hv.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className={`${cellClass} font-medium text-left text-gray-600 max-w-[100px] truncate`} title={labels[i]}>
                  {compact ? labels[i]?.slice(0, 8) : labels[i]}
                </td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className={`${cellClass} font-mono ${
                      i === j ? 'bg-blue-100 font-bold' : ''
                    }`}
                  >
                    {formatPercent(val, 1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
