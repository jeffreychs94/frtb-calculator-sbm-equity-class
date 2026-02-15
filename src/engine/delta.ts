import type { Trade, BucketResult, RiskChargeResult, CorrelationScenario } from '../types';
import {
  BUCKET_COUNT,
  DELTA_RISK_WEIGHTS,
  SAME_TICKER_CORRELATION,
  INTRA_BUCKET_CORRELATION,
  INTER_BUCKET_CORRELATION,
} from '../constants/regulatory';
import { computeKb, computeSb, computeInterBucket } from './aggregation';
import { scaleCorrelation, scaleCorrelationMatrix } from './scenarios';

interface DeltaEntry {
  tradeId: string;
  ticker: string;
  sensitivity: number;
  ws: number;
}

function groupByBucket(trades: Trade[]): Map<number, DeltaEntry[]> {
  const map = new Map<number, DeltaEntry[]>();
  for (const t of trades) {
    if (t.DeltaSensitivity === 0) continue;
    const rw = DELTA_RISK_WEIGHTS[t.Bucket] ?? 0;
    const ws = rw * t.DeltaSensitivity;
    const entry: DeltaEntry = {
      tradeId: t.TradeID,
      ticker: t.Ticker,
      sensitivity: t.DeltaSensitivity,
      ws,
    };
    if (!map.has(t.Bucket)) map.set(t.Bucket, []);
    map.get(t.Bucket)!.push(entry);
  }
  return map;
}

function buildIntraBucketCorrelation(
  entries: DeltaEntry[],
  bucket: number,
  scenario: CorrelationScenario
): number[][] {
  const n = entries.length;
  const baseSameName = SAME_TICKER_CORRELATION;
  const baseDiffName = INTRA_BUCKET_CORRELATION[bucket] ?? 0.15;

  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const baseRho =
          entries[i].ticker === entries[j].ticker ? baseSameName : baseDiffName;
        matrix[i][j] = scaleCorrelation(baseRho, scenario);
      }
    }
  }
  return matrix;
}

export function computeDeltaCharge(
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
    const labels = entries.map((e) => `${e.ticker} (${e.tradeId})`);
    const correlationMatrix = buildIntraBucketCorrelation(entries, b, scenario);

    const Kb = computeKb(ws, correlationMatrix);
    const Sb = computeSb(ws, Kb);

    Kb_values[b - 1] = Kb;
    Sb_values[b - 1] = Sb;

    bucketResults.push({
      bucket: b,
      Kb,
      Sb,
      weightedSensitivities: entries.map((e) => ({ key: `${e.ticker} (${e.tradeId})`, ws: e.ws })),
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
