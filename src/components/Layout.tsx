import type { ReactNode } from 'react';
import ScenarioToggle from './ScenarioToggle';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">FRTB SBM Calculator</h1>
          <p className="text-xs text-gray-500">Equity Risk Class — BCBS d457</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 uppercase">Correlation Scenario</span>
          <ScenarioToggle />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-4">{children}</main>
    </div>
  );
}
