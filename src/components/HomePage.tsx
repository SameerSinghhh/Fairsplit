import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const generateGroupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateGroup = () => {
    const groupCode = generateGroupCode();
    navigate(`/group/${groupCode}`);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      navigate(`/group/${joinCode}`);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary-600 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <div className="text-4xl font-bold text-primary-600 animate-spin-slow">FS</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          FairSplit
        </h1>
        <p className="text-gray-600">
          Split bills fairly and easily
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          <button
            onClick={handleCreateGroup}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Create New Group
          </button>

          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="w-full bg-white text-primary-600 border border-primary-600 py-3 px-4 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Join Existing Group
          </button>

          {showJoinForm && (
            <form onSubmit={handleJoinGroup} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Join
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 