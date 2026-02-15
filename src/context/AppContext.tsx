import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import type { Trade, CorrelationScenario, AllResults } from '../types';
import { computeDeltaCharge } from '../engine/delta';
import { computeVegaCharge } from '../engine/vega';
import { computeCurvatureCharge } from '../engine/curvature';

interface State {
  trades: Trade[];
  scenario: CorrelationScenario;
  fileName: string;
}

type Action =
  | { type: 'SET_TRADES'; trades: Trade[]; fileName: string }
  | { type: 'SET_SCENARIO'; scenario: CorrelationScenario };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TRADES':
      return { ...state, trades: action.trades, fileName: action.fileName };
    case 'SET_SCENARIO':
      return { ...state, scenario: action.scenario };
    default:
      return state;
  }
}

interface AppContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  results: AllResults | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    trades: [],
    scenario: 'medium',
    fileName: '',
  });

  const results = useMemo<AllResults | null>(() => {
    if (state.trades.length === 0) return null;
    return {
      delta: computeDeltaCharge(state.trades, state.scenario),
      vega: computeVegaCharge(state.trades, state.scenario),
      curvature: computeCurvatureCharge(state.trades, state.scenario),
    };
  }, [state.trades, state.scenario]);

  return (
    <AppContext.Provider value={{ state, dispatch, results }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
