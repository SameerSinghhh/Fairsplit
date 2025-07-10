import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GroupPage from './components/GroupPage';
import PayerSelectionPage from './components/PayerSelectionPage';
import SummaryPage from './components/SummaryPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-fire-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fire-400/10 rounded-full blur-3xl animate-float"></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="glass rounded-3xl shadow-3xl overflow-hidden relative">
              {/* Top notch simulation */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black/30 rounded-b-2xl z-20"></div>
              
              {/* Content area */}
              <div className="min-h-[85vh] max-h-[85vh] overflow-y-auto pt-8 pb-6 px-6">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/group/:groupId" element={<GroupPage />} />
                  <Route path="/payer-selection/:groupId" element={<PayerSelectionPage />} />
                  <Route path="/summary/:groupId" element={<SummaryPage />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
