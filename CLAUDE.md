# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # TypeScript check (tsc -b) + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test framework is configured.

## What This Is

FRTB Sensitivity-Based Method (SBM) calculator for the **Equity Risk Class**, compliant with BCBS d457. All computation is client-side — no backend. Users import trade data via CSV and the app computes Delta, Vega, and Curvature risk charges across 13 regulatory buckets with three correlation scenarios (Low/Medium/High).

## Architecture

**Calculation engine** (`src/engine/`) is pure functions with no UI dependencies. The flow is:

1. CSV parsed via PapaParse → `Trade[]` objects
2. `AppContext` stores trades + selected correlation scenario, memoizes results via `useMemo`
3. Three independent engines compute risk charges: `computeDeltaCharge`, `computeVegaCharge`, `computeCurvatureCharge`
4. Each engine: groups trades by bucket → builds intra-bucket correlation matrix → computes Kb/Sb per bucket → inter-bucket aggregation → total charge

**Key modules:**
- `src/constants/regulatory.ts` — All d457 parameters: 13 bucket risk weights, intra-bucket correlations, 13×13 inter-bucket gamma matrix, vega RW sigma
- `src/engine/aggregation.ts` — Shared math: `computeKb` (sqrt of quadratic form), `computeSb` (capped bucket sum), `computeInterBucket`
- `src/engine/scenarios.ts` — Correlation scaling: Medium=baseline, High=min(ρ×1.25, 1), Low=max(2ρ−1, ρ×0.75)
- `src/context/AppContext.tsx` — Global state via `useReducer`, exposes `useAppContext()` hook

**UI tabs:** Summary → Delta/Vega/Curvature (intra-bucket matrices for all 13 buckets) → Inter-Bucket (13×13 matrices) → Input Data (CSV import)

## Regulatory Calculation Details

- **Delta**: WS = RW × DeltaSensitivity. Intra-bucket ρ: 99.9% same ticker, bucket-specific for different tickers.
- **Vega**: RW = min(RWσ × √T / √0.5, 100%). Intra-bucket ρ = ρ_name × ρ_tenor where ρ_tenor = min(Ti,Tj)/max(Ti,Tj).
- **Curvature**: CVR_up = V_up − V_base − RW×Delta, CVR_down = V_down − V_base + RW×Delta. Uses ρ² for correlations and ψ function (zero when both CVRs negative).

## Tech Stack

React 19 + TypeScript (strict) + Vite + Tailwind CSS v4 (via `@tailwindcss/vite` plugin). PapaParse for CSV parsing. No external state management library.
