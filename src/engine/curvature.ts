import type { Trade, CurvatureBucketResult, CurvatureChargeResult, CorrelationScenario } from '../types';
import {
  BUCKET_COUNT,
  DELTA_RISK_WEIGHTS,
  SAME_TICKER_CORRELATION,
  INTRA_BUCKET_CORRELATION,
  INTER_BUCKET_CORRELATION,
} from '../constants/regulatory';
import { scaleCorrelation, scaleCorrelationMatrix } from './scenarios';

interface CurvatureEntry {
  tradeId: string;
  ticker: string;
  delta: number;
  rw: number;
  V_base: number;
  V_up: number;
  V_down: number;
  cvrUp: number;
  cvrDown: number;
}

function psi(x: number, y: number): number {
  return (x < 0 && y < 0) ? 0 : 1;
}

function groupByBucket(trades: Trade[]): Map<number, CurvatureEntry[]> {
  const map = new Map<number, CurvatureEntry[]>();
  for (const t of trades) {
    if (t.V_up === 0 && t.V_down === 0 && t.V_base === 0) continue;
    const rw = DELTA_RISK_WEIGHTS[t.Bucket] ?? 0;
    const cvrUp = t.V_up - t.V_base - rw * t.DeltaSensitivity;
    const cvrDown = t.V_down - t.V_base + rw * t.DeltaSensitivity;
    const entry: CurvatureEntry = {
      tradeId: t.TradeID,
      ticker: t.Ticker,
      delta: t.DeltaSensitivity,
      rw,
      V_base: t.V_base,
      V_up: t.V_up,
      V_down: t.V_down,
      cvrUp,
      cvrDown,
    };
    if (!map.has(t.Bucket)) map.set(t.Bucket, []);
    map.get(t.Bucket)!.push(entry);
  }
  return map;
}

function buildCorrelationMatrix(
  entries: CurvatureEntry[],
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
        // Curvature uses rho^2 for intra-bucket
        const scaledRho = scaleCorrelation(baseRho, scenario);
        matrix[i][j] = scaledRho * scaledRho;
      }
    }
  }
  return matrix;
}

function computeCurvatureKb(
  cvr: number[],
  correlationMatrix: number[][]
): number {
  const n = cvr.length;
  if (n === 0) return 0;

  let sumMax = 0;
  for (let k = 0; k < n; k++) {
    sumMax += Math.max(cvr[k], 0);
  }

  let crossTerm = 0;
  for (let k = 0; k < n; k++) {
    for (let l = 0; l < n; l++) {
      if (k !== l) {
        crossTerm += correlationMatrix[k][l] * cvr[k] * cvr[l] * psi(cvr[k], cvr[l]);
      }
    }
  }

  return Math.sqrt(Math.max(0, sumMax + crossTerm));
}

export function computeCurvatureCharge(
  trades: Trade[],
  scenario: CorrelationScenario
): CurvatureChargeResult {
  const byBucket = groupByBucket(trades);
  const bucketResults: CurvatureBucketResult[] = [];
  const Kb_values = new Array(BUCKET_COUNT).fill(0);
  const Sb_values = new Array(BUCKET_COUNT).fill(0);

  for (let b = 1; b <= BUCKET_COUNT; b++) {
    const entries = byBucket.get(b) ?? [];
    const cvrUpArr = entries.map((e) => e.cvrUp);
    const cvrDownArr = entries.map((e) => e.cvrDown);
    const labels = entries.map((e) => `${e.ticker} (${e.tradeId})`);
    const correlationMatrix = buildCorrelationMatrix(entries, b, scenario);

    const Kb_plus = computeCurvatureKb(cvrUpArr, correlationMatrix);
    const Kb_minus = computeCurvatureKb(cvrDownArr, correlationMatrix);
    const Kb = Math.max(Kb_plus, Kb_minus);
    const bindingDirection: 'up' | 'down' = Kb_plus >= Kb_minus ? 'up' : 'down';

    // Sb uses CVR from the binding direction
    const bindingCvr = bindingDirection === 'up' ? cvrUpArr : cvrDownArr;
    const sumCvr = bindingCvr.reduce((a, v) => a + v, 0);
    const Sb = Kb === 0 ? 0 : Math.max(-Kb, Math.min(sumCvr, Kb));

    Kb_values[b - 1] = Kb;
    Sb_values[b - 1] = Sb;

    bucketResults.push({
      bucket: b,
      Kb,
      Kb_plus,
      Kb_minus,
      Sb,
      bindingDirection,
      trades: entries.map((e) => ({
        key: `${e.ticker} (${e.tradeId})`,
        delta: e.delta,
        rw: e.rw,
        V_base: e.V_base,
        V_up: e.V_up,
        V_down: e.V_down,
        cvrUp: e.cvrUp,
        cvrDown: e.cvrDown,
      })),
      correlationMatrix,
      labels,
    });
  }

  // Inter-bucket: use rho^2 for gamma as well for curvature
  const baseGamma = scaleCorrelationMatrix(INTER_BUCKET_CORRELATION, scenario);
  const gammaMatrix = baseGamma.map((row, i) =>
    row.map((val, j) => (i === j ? 1 : val * val))
  );

  // Inter-bucket aggregation with psi
  let total = 0;
  for (let b = 0; b < BUCKET_COUNT; b++) {
    total += Kb_values[b] * Kb_values[b];
    for (let c = 0; c < BUCKET_COUNT; c++) {
      if (b !== c) {
        total += gammaMatrix[b][c] * Sb_values[b] * Sb_values[c] * psi(Sb_values[b], Sb_values[c]);
      }
    }
  }
  const totalCharge = Math.sqrt(Math.max(0, total));

  return {
    totalCharge,
    bucketResults,
    interBucketMatrix: gammaMatrix,
    Sb_values,
    Kb_values,
  };
}
