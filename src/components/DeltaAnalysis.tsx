import { useAppContext } from '../context/AppContext';
import CorrelationMatrix from './CorrelationMatrix';
import { formatCurrency } from '../utils/formatting';
import { BUCKET_DESCRIPTIONS, DELTA_RISK_WEIGHTS } from '../constants/regulatory';

export default function DeltaAnalysis() {
  const { results } = useAppContext();

  if (!results) {
    return <p className="text-gray-400 py-8 text-center">No data loaded</p>;
  }

  const { delta } = results;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Delta Risk Charge — Intra-Bucket Analysis</h2>
        <div className="text-xl font-mono font-bold text-blue-700">
          {formatCurrency(delta.totalCharge)}
        </div>
      </div>

      {delta.bucketResults.map((bucketResult) => {
        const b = bucketResult.bucket;
        const hasData = bucketResult.weightedSensitivities.length > 0;

        return (
          <div key={b} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">
                Bucket {b} — {BUCKET_DESCRIPTIONS[b]}
              </h3>
              <span className="text-xs text-gray-400">RW = {(DELTA_RISK_WEIGHTS[b] * 100).toFixed(0)}%</span>
            </div>

            {hasData ? (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Weighted Sensitivities (WS = RW x s)</h4>
                  <table className="text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-1 text-left">Name</th>
                        <th className="px-3 py-1 text-right">WS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bucketResult.weightedSensitivities.map((ws, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-1">{ws.key}</td>
                          <td className="px-3 py-1 text-right font-mono">{formatCurrency(ws.ws)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <CorrelationMatrix
                  matrix={bucketResult.correlationMatrix}
                  labels={bucketResult.labels}
                  title="Correlation Matrix"
                />

                <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                  <span className="font-semibold">Kb = </span>
                  <span className="font-mono">{formatCurrency(bucketResult.Kb)}</span>
                  <span className="mx-4 font-semibold">Sb = </span>
                  <span className="font-mono">{formatCurrency(bucketResult.Sb)}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-300 text-sm italic">No delta sensitivities</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
