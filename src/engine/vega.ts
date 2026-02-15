import type { Trade, BucketResult, RiskChargeResult, CorrelationScenario } from '../types';
import { TENOR_YEARS } from '../types';
import {
  BUCKET_COUNT,
  VEGA_RW_SIGMA,
  INTRA_BUCKET_CORRELATION,
  INTER_BUCKET_CORRELATION,
} from '../constants/regulatory';
import { computeKb, computeSb, computeInterBucket } from './aggregation';
import { scaleCorrelation, scaleCorrelationMatrix } from './scenarios';

interface VegaEntry {
  tradeId: string;
  ticker: string;
  tenor: string;
  tenorYears: number;
  sensitivity: number;
  rw: number;
  ws: number;
}

function vegaRiskWeight(tenorYears: number): number {
  return Math.min(VEGA_RW_SIGMA * Math.sqrt(tenorYears) / Math.sqrt(0.5), 1.0);
}

function groupByBucket(trades: Trade[]): Map<number, VegaEntry[]> {
  const map = new Map<number, VegaEntry[]>();
  for (const t of trades) {
    if (t.VegaSensitivity === 0) continue;
    const tenorYears = TENOR_YEARS[t.VegaTenor] ?? 1;
    const rw = vegaRiskWeight(tenorYears);
    const ws = rw * t.VegaSensitivity;
    const entry: VegaEntry = {
      tradeId: t.TradeID,
      ticker: t.Ticker,
      tenor: t.VegaTenor || '1Y',
      tenorYears,
      sensitivity: t.VegaSensitivity,
      rw,
      ws,
    };
    if (!map.has(t.Bucket)) map.set(t.Bucket, []);
    map.get(t.Bucket)!.push(entry);
  }
  return map;
}

function buildIntraBucketCorrelation(
  entries: VegaEntry[],
  bucket: number,
  scenario: CorrelationScenario
): number[][] {
  const n = entries.length;
  const baseDiffName = INTRA_BUCKET_CORRELATION[bucket] ?? 0.15;

  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        // rho_name
        const rhoName = entries[i].ticker === entries[j].ticker ? 1.0 : baseDiffName;
        // rho_tenor = min(Ti, Tj) / max(Ti, Tj)
        const ti = entries[i].tenorYears;
        const tj = entries[j].tenorYears;
        const rhoTenor = Math.min(ti, tj) / Math.max(ti, tj);
        const baseRho = rhoName * rhoTenor;
        matrix[i][j] = scaleCorrelation(baseRho, scenario);
      }
    }
  }
  return matrix;
}

export function computeVegaCharge(
  trades: Trade[],
  scenario: CorrelationScenario
): RiskChargeResult {
  const byBucket = groupByBucket(trades);
  const bucketResults: BucketResult[] = [];
  const Kb_values = new Array(BUCKET_COUNT).fill(0);
  const Sb_values = new Array(BUCKET_COUNT).fill(0);

  for (let b = 1; b <= BUCKET_COUNT; b++) {
    const entries = byBucket.get(b) ?? [];
    const ws = entries.map((e) => e.ws);
    const labels = entries.map((e) => `${e.ticker}/${e.tenor} (${e.tradeId})`);
    const correlationMatrix = buildIntraBucketCorrelation(entries, b, scenario);

    const Kb = computeKb(ws, correlationMatrix);
    const Sb = computeSb(ws, Kb);

    Kb_values[b - 1] = Kb;
    Sb_values[b - 1] = Sb;

    bucketResults.push({
      bucket: b,
      Kb,
      Sb,
      weightedSensitivities: entries.map((e) => ({ key: `${e.ticker}/${e.tenor} (${e.tradeId})`, ws: e.ws })),
      correlationMatrix,
      labels,
    });
  }

  const gammaMatrix = scaleCorrelationMatrix(INTER_BUCKET_CORRELATION, scenario);
  const totalCharge = computeInterBucket(Kb_values, Sb_values, gammaMatrix);

  return {
    totalCharge,
    bucketResults,
    interBucketMatrix: gammaMatrix,
    Sb_values,
    Kb_values,
  };
}
