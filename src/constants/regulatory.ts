// FRTB d457 Equity Risk Class — Regulatory Parameters

export const BUCKET_COUNT = 13;

export const BUCKET_DESCRIPTIONS: Record<number, string> = {
  1: 'EM Large Cap — Consumer',
  2: 'EM Large Cap — Telecom/Industrial',
  3: 'EM Large Cap — Basic Materials/Energy',
  4: 'EM Large Cap — Financials',
  5: 'AE Large Cap — Consumer',
  6: 'AE Large Cap — Telecom/Industrial',
  7: 'AE Large Cap — Basic Materials/Energy',
  8: 'AE Large Cap — Financials',
  9: 'EM Small Cap',
  10: 'AE Small Cap',
  11: 'Other Sector',
  12: 'Large Cap AE Indices',
  13: 'Other Indices',
};

// Delta risk weights per bucket (MAR21.77)
export const DELTA_RISK_WEIGHTS: Record<number, number> = {
  1: 0.55,
  2: 0.60,
  3: 0.45,
  4: 0.55,
  5: 0.30,
  6: 0.35,
  7: 0.40,
  8: 0.50,
  9: 0.70,
  10: 0.50,
  11: 0.70,
  12: 0.15,
  13: 0.25,
};

// Intra-bucket correlations for DIFFERENT tickers in the same bucket (MAR21.78)
// Same ticker correlation = 99.90%
export const SAME_TICKER_CORRELATION = 0.999;

export const INTRA_BUCKET_CORRELATION: Record<number, number> = {
  1: 0.15,
  2: 0.15,
  3: 0.15,
  4: 0.15,
  5: 0.25,
  6: 0.25,
  7: 0.25,
  8: 0.25,
  9: 0.075,
  10: 0.125,
  11: 0.075,
  12: 0.80,
  13: 0.80,
};

// Inter-bucket correlations (gamma_bc) — 13x13 symmetric matrix (MAR21.80)
// Rows/cols indexed 0-12 for buckets 1-13
export const INTER_BUCKET_CORRELATION: number[][] = [
  //  1     2     3     4     5     6     7     8     9    10    11    12    13
  [ 1.00, 0.15, 0.15, 0.15, 0.10, 0.10, 0.10, 0.10, 0.15, 0.10, 0.15, 0.10, 0.10], // 1
  [ 0.15, 1.00, 0.15, 0.15, 0.10, 0.10, 0.10, 0.10, 0.15, 0.10, 0.15, 0.10, 0.10], // 2
  [ 0.15, 0.15, 1.00, 0.15, 0.10, 0.10, 0.10, 0.10, 0.15, 0.10, 0.15, 0.10, 0.10], // 3
  [ 0.15, 0.15, 0.15, 1.00, 0.10, 0.10, 0.10, 0.10, 0.15, 0.10, 0.15, 0.10, 0.10], // 4
  [ 0.10, 0.10, 0.10, 0.10, 1.00, 0.25, 0.25, 0.25, 0.10, 0.25, 0.10, 0.25, 0.25], // 5
  [ 0.10, 0.10, 0.10, 0.10, 0.25, 1.00, 0.25, 0.25, 0.10, 0.25, 0.10, 0.25, 0.25], // 6
  [ 0.10, 0.10, 0.10, 0.10, 0.25, 0.25, 1.00, 0.25, 0.10, 0.25, 0.10, 0.25, 0.25], // 7
  [ 0.10, 0.10, 0.10, 0.10, 0.25, 0.25, 0.25, 1.00, 0.10, 0.25, 0.10, 0.25, 0.25], // 8
  [ 0.15, 0.15, 0.15, 0.15, 0.10, 0.10, 0.10, 0.10, 1.00, 0.10, 0.15, 0.10, 0.10], // 9
  [ 0.10, 0.10, 0.10, 0.10, 0.25, 0.25, 0.25, 0.25, 0.10, 1.00, 0.10, 0.25, 0.25], // 10
  [ 0.15, 0.15, 0.15, 0.15, 0.10, 0.10, 0.10, 0.10, 0.15, 0.10, 1.00, 0.10, 0.10], // 11
  [ 0.10, 0.10, 0.10, 0.10, 0.25, 0.25, 0.25, 0.25, 0.10, 0.25, 0.10, 1.00, 0.25], // 12
  [ 0.10, 0.10, 0.10, 0.10, 0.25, 0.25, 0.25, 0.25, 0.10, 0.25, 0.10, 0.25, 1.00], // 13
];

// Vega risk weight parameters
export const VEGA_RW_SIGMA = 0.78; // RWsigma for equity vega

// Vega intra-bucket: same name different tenor uses rho_tenor = min(Tk,Tl)/max(Tk,Tl)
// Vega intra-bucket: different name uses the delta intra-bucket correlation as rho_name
// Combined: rho_kl = rho_name * rho_tenor
export const VEGA_SAME_NAME_CORRELATION = 1.0;
