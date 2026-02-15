import type { CorrelationScenario } from '../types';
import { useAppContext } from '../context/AppContext';

const scenarios: CorrelationScenario[] = ['low', 'medium', 'high'];

export default function ScenarioToggle() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {scenarios.map((s) => (
        <button
          key={s}
          onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: s })}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors ${
            state.scenario === s
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
