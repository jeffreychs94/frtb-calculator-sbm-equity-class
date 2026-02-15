import { useAppContext } from '../context/AppContext';
import CorrelationMatrix from './CorrelationMatrix';
import { formatCurrency } from '../utils/formatting';
import { BUCKET_DESCRIPTIONS, VEGA_RW_SIGMA } from '../constants/regulatory';
import { TENOR_YEARS } from '../types';

export default function VegaAnalysis() {
  const { results } = useAppContext();

  if (!results) {
    return <p className="text-gray-400 py-8 text-center">No data loaded</p>;
  }

  const { vega } = results;

  const tenorRWs = Object.entries(TENOR_YEARS).map(([tenor, years]) => ({
    tenor,
    rw: Math.min(VEGA_RW_SIGMA * Math.sqrt(years) / Math.sqrt(0.5), 1.0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Vega Risk Charge — Intra-Bucket Analysis</h2>
        <div className="text-xl font-mono font-bold text-purple-700">
          {formatCurrency(vega.totalCharge)}
        </div>
      </div>

      {/* Vega RW table */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-2">Vega Risk Weights by Tenor</h3>
        <p className="text-xs text-gray-500 mb-2">RW = min(RW_sigma x sqrt(T) / sqrt(0.5), 100%) where RW_sigma = {(VEGA_RW_SIGMA * 100).toFixed(0)}%</p>
        <table className="text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {tenorRWs.map(({ tenor }) => (
                <th key={tenor} className="px-4 py-1 text-center">{tenor}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {tenorRWs.map(({ tenor, rw }) => (
                <td key={tenor} className="px-4 py-1 text-center font-mono">
                  {(rw * 100).toFixed(1)}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {vega.bucketResults.map((bucketResult) => {
        const b = bucketResult.bucket;
        const hasData = bucketResult.weightedSensitivities.length > 0;

        return (
          <div key={b} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">
              Bucket {b} — {BUCKET_DESCRIPTIONS[b]}
            </h3>

            {hasData ? (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Weighted Vega Sensitivities</h4>
                  <table className="text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-1 text-left">Ticker / Tenor</th>
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
                  title="Correlation Matrix (rho_name x rho_tenor)"
                />

                <div className="mt-3 p-2 bg-purple-50 rounded text-sm">
                  <span className="font-semibold">Kb = </span>
                  <span className="font-mono">{formatCurrency(bucketResult.Kb)}</span>
                  <span className="mx-4 font-semibold">Sb = </span>
                  <span className="font-mono">{formatCurrency(bucketResult.Sb)}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-300 text-sm italic">No vega sensitivities</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
