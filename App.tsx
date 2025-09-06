import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { DataSummary } from './types';

function App() {
  const [data, setData] = useState<DataSummary | null>(null);

  const handleDataLoaded = (loadedData: DataSummary) => {
    setData(loadedData);
  };

  const handleBack = () => {
    setData(null);
  };

  return (
    <div className="min-h-screen">
      {data ? (
        <Dashboard data={data} onBack={handleBack} />
      ) : (
        <LandingPage onDataLoaded={handleDataLoaded} />
      )}
    </div>
  );
}

export default App;