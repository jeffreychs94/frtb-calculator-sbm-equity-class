import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import SummaryDashboard from './components/SummaryDashboard';
import DeltaAnalysis from './components/DeltaAnalysis';
import VegaAnalysis from './components/VegaAnalysis';
import CurvatureAnalysis from './components/CurvatureAnalysis';
import InterBucketAnalysis from './components/InterBucketAnalysis';
import InputDataView from './components/InputDataView';

type Tab = 'summary' | 'delta' | 'vega' | 'curvature' | 'interbucket' | 'input';

const tabs: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'delta', label: 'Delta' },
  { id: 'vega', label: 'Vega' },
  { id: 'curvature', label: 'Curvature' },
  { id: 'interbucket', label: 'Inter-Bucket' },
  { id: 'input', label: 'Input Data' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  return (
    <AppProvider>
      <Layout>
        <nav className="flex gap-1 mb-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'summary' && <SummaryDashboard />}
          {activeTab === 'delta' && <DeltaAnalysis />}
          {activeTab === 'vega' && <VegaAnalysis />}
          {activeTab === 'curvature' && <CurvatureAnalysis />}
          {activeTab === 'interbucket' && <InterBucketAnalysis />}
          {activeTab === 'input' && <InputDataView />}
        </div>
      </Layout>
    </AppProvider>
  );
}

export default App;
