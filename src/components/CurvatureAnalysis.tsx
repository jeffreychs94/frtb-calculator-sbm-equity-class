import { useAppContext } from '../context/AppContext';
import CorrelationMatrix from './CorrelationMatrix';
import { formatCurrency } from '../utils/formatting';
import { BUCKET_DESCRIPTIONS, DELTA_RISK_WEIGHTS } from '../constants/regulatory';

export default function CurvatureAnalysis() {
  const { results } = useAppContext();

  if (!results) {
    return <p className="text-gray-400 py-8 text-center">No data loaded</p>;
  }

  const { curvature } = results;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Curvature Risk Charge — Intra-Bucket Analysis</h2>
        <div className="text-xl font-mono font-bold text-amber-700">
          {formatCurrency(curvature.totalCharge)}
        </div>
      </div>

      {curvature.bucketResults.map((bucketResult) => {
        const b = bucketResult.bucket;
        const hasData = bucketResult.trades.length > 0;
        const rw = DELTA_RISK_WEIGHTS[b];

        return (
          <div key={b} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">
                Bucket {b} — {BUCKET_DESCRIPTIONS[b]}
              </h3>
              <span className="text-xs text-gray-400">Delta RW = {(rw * 100).toFixed(0)}%</span>
            </div>

            {hasData ? (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">CVR Breakdown per Trade</h4>
                  <p className="text-xs text-gray-400 mb-2">
                    CVR_up = V_up - V_base - RW x Delta &nbsp;|&nbsp; CVR_down = V_down - V_base + RW x Delta
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-sm border-collapse w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-1 text-left">Name</th>
                          <th className="px-2 py-1 text-right">Delta</th>
                          <th className="px-2 py-1 text-right">RW</th>
                          <th className="px-2 py-1 text-right">V_base</th>
                          <th className="px-2 py-1 text-right">V_up</th>
                          <th className="px-2 py-1 text-right">V_down</th>
                          <th className="px-2 py-1 text-right border-l-2 border-gray-300">RW x Delta</th>
                          <th className={`px-2 py-1 text-right ${bucketResult.bindingDirection === 'up' ? 'font-bold text-amber-700' : ''}`}>
                            CVR_up
                          </th>
                          <th className={`px-2 py-1 text-right ${bucketResult.bindingDirection === 'down' ? 'font-bold text-amber-700' : ''}`}>
                            CVR_down
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bucketResult.trades.map((t, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-2 py-1">{t.key}</td>
                            <td className="px-2 py-1 text-right font-mono">{formatCurrency(t.delta)}</td>
                            <td className="px-2 py-1 text-right font-mono">{(t.rw * 100).toFixed(0)}%</td>
                            <td className="px-2 py-1 text-right font-mono">{formatCurrency(t.V_base)}</td>
                            <td className="px-2 py-1 text-right font-mono">{formatCurrency(t.V_up)}</td>
                            <td className="px-2 py-1 text-right font-mono">{formatCurrency(t.V_down)}</td>
                            <td className="px-2 py-1 text-right font-mono border-l-2 border-gray-300">
                              {formatCurrency(t.rw * t.delta)}
                            </td>
                            <td className={`px-2 py-1 text-right font-mono ${
                              bucketResult.bindingDirection === 'up' ? 'font-bold text-amber-700' : ''
                            }`}>
                              {formatCurrency(t.cvrUp)}
                            </td>
                            <td className={`px-2 py-1 text-right font-mono ${
                              bucketResult.bindingDirection === 'down' ? 'font-bold text-amber-700' : ''
                            }`}>
                              {formatCurrency(t.cvrDown)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <CorrelationMatrix
                  matrix={bucketResult.correlationMatrix}
                  labels={bucketResult.labels}
                  title="Correlation Matrix (rho^2)"
                />

                <div className="mt-3 p-2 bg-amber-50 rounded text-sm space-y-1">
                  <div>
                    <span className="font-semibold">Kb+ = </span>
                    <span className={`font-mono ${bucketResult.bindingDirection === 'up' ? 'font-bold' : ''}`}>
                      {formatCurrency(bucketResult.Kb_plus)}
                    </span>
                    <span className="mx-3 font-semibold">Kb- = </span>
                    <span className={`font-mono ${bucketResult.bindingDirection === 'down' ? 'font-bold' : ''}`}>
                      {formatCurrency(bucketResult.Kb_minus)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Kb = max(Kb+, Kb-) = </span>
                    <span className="font-mono font-bold">{formatCurrency(bucketResult.Kb)}</span>
                    <span className="ml-2 text-xs text-amber-600">
                      (binding: {bucketResult.bindingDirection === 'up' ? 'UP' : 'DOWN'})
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Sb = </span>
                    <span className="font-mono">{formatCurrency(bucketResult.Sb)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-300 text-sm italic">No curvature data</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
