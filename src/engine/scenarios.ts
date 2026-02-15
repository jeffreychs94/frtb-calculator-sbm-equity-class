import type { CorrelationScenario } from '../types';

export function scaleCorrelation(rho: number, scenario: CorrelationScenario): number {
  if (scenario === 'medium') return rho;
  if (scenario === 'high') return Math.min(rho * 1.25, 1);
  // low: max(2*rho - 1, rho * 0.75)
  return Math.max(2 * rho - 1, rho * 0.75);
}

export function scaleCorrelationMatrix(
  matrix: number[][],
  scenario: CorrelationScenario
): number[][] {
  return matrix.map((row, i) =>
    row.map((val, j) => (i === j ? 1 : scaleCorrelation(val, scenario)))
  );
}
