import { useAppContext } from '../context/AppContext';
import CorrelationMatrix from './CorrelationMatrix';
import { formatCurrency } from '../utils/formatting';

export default function InterBucketAnalysis() {
  const { results } = useAppContext();

  if (!results) {
    return <p className="text-gray-400 py-8 text-center">No data loaded</p>;
  }

  const { delta, vega, curvature } = results;
  const bucketLabels = Array.from({ length: 13 }, (_, i) => `B${i + 1}`);
  const total = delta.totalCharge + vega.totalCharge + curvature.totalCharge;

  const sections = [
    {
      title: 'Delta Inter-Bucket Aggregation',
      data: delta,
      color: 'blue',
      label: 'Delta Capital Charge',
    },
    {
      title: 'Vega Inter-Bucket Aggregation',
      data: vega,
      color: 'purple',
      label: 'Vega Capital Charge',
    },
    {
      title: 'Curvature Inter-Bucket Aggregation (gamma^2 with psi)',
      data: curvature,
      color: 'amber',
      label: 'Curvature Capital Charge',
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Inter-Bucket Aggregation</h2>
        <div className="text-xl font-mono font-bold text-green-700">
          Total SBM: {formatCurrency(total)}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">{section.title}</h3>

          <CorrelationMatrix
            matrix={section.data.interBucketMatrix}
            labels={bucketLabels}
            compact
            headerValues={bucketLabels.map((_label, i) => ({
              label: i === 0 ? 'Sb' : '',
              value: section.data.Sb_values[i],
            }))}
          />

          <div className={`mt-3 p-2 bg-${section.color}-50 rounded text-sm`}>
            <span className="font-semibold">{section.label} = </span>
            <span className="font-mono font-bold">{formatCurrency(section.data.totalCharge)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
