import { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { parseCsv } from '../utils/csvParser';
import { parseCsvString } from '../utils/csvParser';

export default function InputDataView() {
  const { state, dispatch } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const trades = await parseCsv(file);
      dispatch({ type: 'SET_TRADES', trades, fileName: file.name });
    } catch (err) {
      alert('Error parsing CSV: ' + (err as Error).message);
    }
  };

  const handleLoadSample = async () => {
    try {
      const resp = await fetch('/sample_trades.csv');
      const text = await resp.text();
      const trades = parseCsvString(text);
      dispatch({ type: 'SET_TRADES', trades, fileName: 'sample_trades.csv' });
    } catch (err) {
      alert('Error loading sample data: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Import CSV
        </button>
        <button
          onClick={handleLoadSample}
          className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
        >
          Load Sample Data
        </button>
        {state.fileName && (
          <span className="text-sm text-gray-500">
            Loaded: <strong>{state.fileName}</strong> ({state.trades.length} trades)
          </span>
        )}
      </div>

      {state.trades.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-2 py-1.5">TradeID</th>
                <th className="px-2 py-1.5">Type</th>
                <th className="px-2 py-1.5">Ticker</th>
                <th className="px-2 py-1.5 text-center">Bucket</th>
                <th className="px-2 py-1.5 text-right">Delta</th>
                <th className="px-2 py-1.5 text-right">Vega</th>
                <th className="px-2 py-1.5 text-center">Tenor</th>
                <th className="px-2 py-1.5 text-right">V_base</th>
                <th className="px-2 py-1.5 text-right">V_up</th>
                <th className="px-2 py-1.5 text-right">V_down</th>
              </tr>
            </thead>
            <tbody>
              {state.trades.map((t) => (
                <tr key={t.TradeID} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-2 py-1 font-mono text-xs">{t.TradeID}</td>
                  <td className="px-2 py-1 text-xs">{t.ProductType}</td>
                  <td className="px-2 py-1">{t.Ticker}</td>
                  <td className="px-2 py-1 text-center">{t.Bucket}</td>
                  <td className="px-2 py-1 text-right font-mono">
                    {t.DeltaSensitivity ? t.DeltaSensitivity.toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {t.VegaSensitivity ? t.VegaSensitivity.toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-1 text-center">{t.VegaTenor || '-'}</td>
                  <td className="px-2 py-1 text-right font-mono">
                    {t.V_base ? t.V_base.toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {t.V_up ? t.V_up.toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {t.V_down ? t.V_down.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
