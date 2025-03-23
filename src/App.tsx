import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GroupPage from './components/GroupPage';
import PayerSelectionPage from './components/PayerSelectionPage';
import SummaryPage from './components/SummaryPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 rounded-t-3xl flex items-center justify-center">
            <div className="w-32 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-full overflow-y-auto pt-6">
            <div className="px-4">
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
    </Router>
  );
}

export default App;
