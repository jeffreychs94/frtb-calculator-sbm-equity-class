import Papa from 'papaparse';
import type { Trade } from '../types';

export function parseCsv(file: File): Promise<Trade[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          const trades: Trade[] = results.data.map((row: any) => ({
            TradeID: String(row.TradeID ?? ''),
            ProductType: String(row.ProductType ?? ''),
            Ticker: String(row.Ticker ?? ''),
            Bucket: Number(row.Bucket) || 0,
            DeltaSensitivity: Number(row.DeltaSensitivity) || 0,
            VegaSensitivity: Number(row.VegaSensitivity) || 0,
            VegaTenor: String(row.VegaTenor ?? ''),
            V_base: Number(row.V_base) || 0,
            V_up: Number(row.V_up) || 0,
            V_down: Number(row.V_down) || 0,
          }));
          resolve(trades.filter((t) => t.TradeID && t.Bucket >= 1 && t.Bucket <= 13));
        } catch (err) {
          reject(err);
        }
      },
      error(err) {
        reject(err);
      },
    });
  });
}

export function parseCsvString(csvString: string): Trade[] {
  const results = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  return results.data.map((row: any) => ({
    TradeID: String(row.TradeID ?? ''),
    ProductType: String(row.ProductType ?? ''),
    Ticker: String(row.Ticker ?? ''),
    Bucket: Number(row.Bucket) || 0,
    DeltaSensitivity: Number(row.DeltaSensitivity) || 0,
    VegaSensitivity: Number(row.VegaSensitivity) || 0,
    VegaTenor: String(row.VegaTenor ?? ''),
    V_base: Number(row.V_base) || 0,
    V_up: Number(row.V_up) || 0,
    V_down: Number(row.V_down) || 0,
  })).filter((t: Trade) => t.TradeID && t.Bucket >= 1 && t.Bucket <= 13);
}
