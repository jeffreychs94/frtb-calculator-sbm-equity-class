export interface Trade {
  TradeID: string;
  ProductType: string;
  Ticker: string;
  Bucket: number;
  DeltaSensitivity: number;
  VegaSensitivity: number;
  VegaTenor: string;
  V_base: number;
  V_up: number;
  V_down: number;
}

export type CorrelationScenario = 'low' | 'medium' | 'high';

export const VEGA_TENORS = ['0.5Y', '1Y', '3Y', '5Y', '10Y'] as const;
export type VegaTenor = typeof VEGA_TENORS[number];

export const TENOR_YEARS: Record<string, number> = {
  '0.5Y': 0.5,
  '1Y': 1,
  '3Y': 3,
  '5Y': 5,
  '10Y': 10,
};

export interface BucketResult {
  bucket: number;
  Kb: number;
  Sb: number;
  weightedSensitivities: { key: string; ws: number }[];
  correlationMatrix: number[][];
  labels: string[];
}

export interface CurvatureBucketResult {
  bucket: number;
  Kb: number;
  Kb_plus: number;
  Kb_minus: number;
  Sb: number;
  bindingDirection: 'up' | 'down';
  trades: {
    key: string;
    delta: number;
    rw: number;
    V_base: number;
    V_up: number;
    V_down: number;
    cvrUp: number;
    cvrDown: number;
  }[];
  correlationMatrix: number[][];
  labels: string[];
}

export interface RiskChargeResult {
  totalCharge: number;
  bucketResults: BucketResult[];
  interBucketMatrix: number[][];
  Sb_values: number[];
  Kb_values: number[];
}

export interface CurvatureChargeResult {
  totalCharge: number;
  bucketResults: CurvatureBucketResult[];
  interBucketMatrix: number[][];
  Sb_values: number[];
  Kb_values: number[];
}

export interface AllResults {
  delta: RiskChargeResult;
  vega: RiskChargeResult;
  curvature: CurvatureChargeResult;
}
