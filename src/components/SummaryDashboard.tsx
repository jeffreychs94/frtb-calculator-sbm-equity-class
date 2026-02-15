import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatting';
import { BUCKET_DESCRIPTIONS } from '../constants/regulatory';

export default function SummaryDashboard() {
  const { results } = useAppContext();

  if (!results) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">Import a CSV file to begin analysis</p>
        <p className="text-sm mt-2">Use the Input Data tab to load trade data</p>
      </div>
    );
  }

  const { delta, vega, curvature } = results;
  const total = delta.totalCharge + vega.totalCharge + curvature.totalCharge;

  const cards = [
    { label: 'Delta KC', value: delta.totalCharge, color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { label: 'Vega KC', value: vega.totalCharge, color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { label: 'Curvature KC', value: curvature.totalCharge, color: 'bg-amber-50 border-amber-200 text-amber-800' },
    { label: 'Total SBM Charge', value: total, color: 'bg-green-50 border-green-200 text-green-900' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border p-4 ${card.color}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide opacity-70">
              {card.label}
            </p>
            <p className="text-xl font-bold mt-1 font-mono">
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-2">Per-Bucket Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2">Bucket</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Delta Kb</th>
              <th className="px-3 py-2 text-right">Delta Sb</th>
              <th className="px-3 py-2 text-right">Vega Kb</th>
              <th className="px-3 py-2 text-right">Vega Sb</th>
              <th className="px-3 py-2 text-right">Curv Kb</th>
              <th className="px-3 py-2 text-right">Curv Sb</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 13 }, (_, i) => i).map((i) => {
              const db = delta.bucketResults[i];
              const vb = vega.bucketResults[i];
              const cb = curvature.bucketResults[i];
              const bucket = i + 1;
              const hasData = db.Kb > 0 || vb.Kb > 0 || cb.Kb > 0;
              return (
                <tr
                  key={bucket}
                  className={`border-t border-gray-200 ${hasData ? '' : 'text-gray-300'}`}
                >
                  <td className="px-3 py-1.5 font-medium">{bucket}</td>
                  <td className="px-3 py-1.5 text-xs">{BUCKET_DESCRIPTIONS[bucket]}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(db.Kb)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(db.Sb)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(vb.Kb)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(vb.Sb)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(cb.Kb)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(cb.Sb)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
