// Shared intra-bucket and inter-bucket aggregation logic

/**
 * Intra-bucket aggregation: Kb = sqrt(sum WS^2 + sum_{k!=l} rho_kl * WS_k * WS_l)
 * Equivalent to: Kb = sqrt(WS^T * Rho * WS) but floored at 0 under the sqrt
 */
export function computeKb(ws: number[], correlationMatrix: number[][]): number {
  const n = ws.length;
  if (n === 0) return 0;

  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      total += correlationMatrix[i][j] * ws[i] * ws[j];
    }
  }
  return Math.sqrt(Math.max(0, total));
}

/**
 * Compute Sb for inter-bucket aggregation.
 * Sb = max(-Kb, min(sum(WS), Kb))
 * If Kb = 0, Sb = 0
 */
export function computeSb(ws: number[], Kb: number): number {
  if (Kb === 0) return 0;
  const sumWs = ws.reduce((a, b) => a + b, 0);
  return Math.max(-Kb, Math.min(sumWs, Kb));
}

/**
 * Inter-bucket aggregation:
 * Charge = sqrt(sum Kb^2 + sum_{b!=c} gamma_bc * Sb * Sc)
 */
export function computeInterBucket(
  Kb_values: number[],
  Sb_values: number[],
  gammaMatrix: number[][]
): number {
  const n = Kb_values.length;
  let total = 0;

  for (let b = 0; b < n; b++) {
    total += Kb_values[b] * Kb_values[b];
    for (let c = 0; c < n; c++) {
      if (b !== c) {
        total += gammaMatrix[b][c] * Sb_values[b] * Sb_values[c];
      }
    }
  }
  return Math.sqrt(Math.max(0, total));
}
