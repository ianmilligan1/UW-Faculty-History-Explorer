import { useState, useEffect } from 'react';
import { loadAndProcessData } from './utils/dataProcessing';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Overview from './components/Overview';
import DepartmentExplorer from './components/DepartmentExplorer';
import RankProgression from './components/RankProgression';
import AdminRoles from './components/AdminRoles';
import DegreeOrigins from './components/DegreeOrigins';
import IndividualLookup from './components/IndividualLookup';
import About from './components/About';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'departments', label: 'Departments' },
  { id: 'ranks', label: 'Rank & Careers' },
  { id: 'admin', label: 'Administration' },
  { id: 'degrees', label: 'Degree Origins' },
  { id: 'lookup', label: 'People' },
  { id: 'about', label: 'About' },
];

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    loadAndProcessData(basePath)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-uw-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-uw-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-uw-gray-600 text-lg">Loading faculty data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-uw-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-uw-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-uw-gray-100">
      <Header />
      <Navigation
        sections={SECTIONS}
        active={activeSection}
        onChange={setActiveSection}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {activeSection === 'overview' && <Overview data={data} />}
        {activeSection === 'departments' && <DepartmentExplorer data={data} />}
        {activeSection === 'ranks' && <RankProgression data={data} />}
        {activeSection === 'admin' && <AdminRoles data={data} />}
        {activeSection === 'degrees' && <DegreeOrigins data={data} />}
        {activeSection === 'lookup' && <IndividualLookup data={data} />}
        {activeSection === 'about' && <About />}
      </main>
      <footer className="bg-uw-black text-uw-gray-500 py-6 text-center text-sm">
        <p>Data drawn from University of Waterloo faculty calendars, 1963–1978.</p>
        <p className="mt-1">Built with React, Tailwind CSS, and Recharts.</p>
      </footer>
    </div>
  );
}

export default App;
