import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
    if (joinCode.trim().length >= 4) {
      navigate(`/group/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="text-center space-y-8">
      {/* Logo and Title */}
      <div className="space-y-6">
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-fire rounded-2xl animate-glow"></div>
          <div className="absolute inset-1 glass-dark rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-12 h-12 text-fire-400 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gradient text-shadow">
            FairSplit
          </h1>
          <p className="text-white/80 text-lg font-medium">
            Split bills fairly and easily
          </p>
          <p className="text-white/60 text-sm">
            Create groups, add expenses, and settle up with friends
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={handleCreateGroup}
          className="w-full btn-primary flex items-center justify-center gap-3 text-lg"
        >
          <PlusIcon className="w-6 h-6" />
          Create New Group
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-dark text-white/60">or</span>
          </div>
        </div>

        {!showJoinForm ? (
          <button
            onClick={() => setShowJoinForm(true)}
            className="w-full btn-secondary flex items-center justify-center gap-3 text-lg"
          >
            <UserGroupIcon className="w-6 h-6" />
            Join Existing Group
          </button>
        ) : (
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80 text-left">
                Enter Group Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="w-full input-glass text-lg text-center tracking-wider"
                maxLength={10}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setJoinCode('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={joinCode.trim().length < 4}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Join Group
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Features */}
      <div className="mt-12 space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Why FairSplit?</h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="glass-dark rounded-xl p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-fire-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-white/90">Fair & Accurate</p>
                <p className="text-white/60">Calculate exact splits including tax and tip</p>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-xl p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-fire-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-white/90">Easy to Use</p>
                <p className="text-white/60">Simple interface, no registration required</p>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-xl p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-fire-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-white/90">Smart Settlement</p>
                <p className="text-white/60">Minimize the number of transactions needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 