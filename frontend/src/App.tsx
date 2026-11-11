import React, { useState } from 'react';
import { FrameworkProvider } from './context/FrameworkContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { FrameworkBuilder } from './pages/FrameworkBuilder';
import { ExtensionAnalysis } from './pages/ExtensionAnalysis';
import { LabellingsPage } from './pages/LabellingsPage';
import { AcceptanceStatusPage } from './pages/AcceptanceStatusPage';
import { StrategicArgPage } from './pages/StrategicArgPage';
import { BestReportsPage } from './pages/BestReportsPage';
import { StrategyproofnessPage } from './pages/StrategyproofnessPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { DocumentationPage } from './pages/DocumentationPage';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'System Overview & Metrics',
  builder: 'Framework & Attacks Builder',
  extensions: 'Dung Semantics & Extension Checks',
  labellings: 'Legal IN / OUT / UNDEC Labellings',
  acceptance: 'Argument Acceptance Status',
  strategic: 'Grounded Direct Mechanism & Utilities',
  'best-reports': 'Strategic Subsets & Best Responses',
  strategyproofness: 'Theorem 5.3 & 5.4 Verification',
  experiments: 'Empirical Study & Random Graphs',
  docs: 'Theory, Semantics & Misprints Guide',
};

export const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard');

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'builder':
        return <FrameworkBuilder />;
      case 'extensions':
        return <ExtensionAnalysis />;
      case 'labellings':
        return <LabellingsPage />;
      case 'acceptance':
        return <AcceptanceStatusPage />;
      case 'strategic':
        return <StrategicArgPage />;
      case 'best-reports':
        return <BestReportsPage />;
      case 'strategyproofness':
        return <StrategyproofnessPage />;
      case 'experiments':
        return <ExperimentsPage />;
      case 'docs':
        return <DocumentationPage />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar activeTitle={PAGE_TITLES[activePage] || 'Argumentation Engine'} />
        <main className="flex-1 overflow-y-auto bg-slate-950">{renderActivePage()}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FrameworkProvider>
      <AppContent />
    </FrameworkProvider>
  );
}
