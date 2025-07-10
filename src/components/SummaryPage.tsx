import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ArrowRightIcon,
  HomeIcon,
  ShareIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface GroupMember {
  id: string;
  name: string;
  items: any[];
}

interface PayerSelection {
  memberId: string;
  isPaying: boolean;
}

const SummaryPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [payerSelections, setPayerSelections] = useState<PayerSelection[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const state = location.state as {
      settlements: Settlement[];
      totalAmount: number;
      members?: GroupMember[];
      payerSelections?: PayerSelection[];
    } | null;

    if (state) {
      setSettlements(state.settlements);
      setTotalAmount(state.totalAmount);
      if (state.members) setMembers(state.members);
      if (state.payerSelections) setPayerSelections(state.payerSelections);
    } else {
      navigate(`/group/${groupId}`);
    }
  }, [location.state, groupId, navigate]);

  const copySettlements = async () => {
    const settlementText = settlements.map(s => 
      `${s.from} → ${s.to}: $${s.amount.toFixed(2)}`
    ).join('\n');
    
    const summaryText = `FairSplit Summary - Group ${groupId}\n\nTotal: $${totalAmount.toFixed(2)}\n\nSettlements:\n${settlementText}`;
    
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareSettlements = async () => {
    const settlementText = settlements.map(s => 
      `${s.from} → ${s.to}: $${s.amount.toFixed(2)}`
    ).join('\n');
    
    const summaryText = `FairSplit Summary - Group ${groupId}\n\nTotal: $${totalAmount.toFixed(2)}\n\nSettlements:\n${settlementText}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FairSplit - Group ${groupId}`,
          text: summaryText,
        });
      } catch (err) {
        console.error('Failed to share:', err);
        copySettlements();
      }
    } else {
      copySettlements();
    }
  };

  const payingMembers = members.filter(member => 
    payerSelections.find(p => p.memberId === member.id)?.isPaying
  );

  const nonPayingMembers = members.filter(member => 
    !payerSelections.find(p => p.memberId === member.id)?.isPaying
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/payer-selection/${groupId}`)}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Payment Summary</h1>
          <p className="text-white/60 text-sm">Group {groupId}</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Success Icon */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-fire rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
          <CheckCircleIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Split Calculated!</h2>
        <p className="text-white/60">Here's who owes what</p>
      </div>

      {/* Total Amount */}
      <div className="card-glass text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Total Amount</h3>
        <p className="text-4xl font-bold text-gradient">${totalAmount.toFixed(2)}</p>
      </div>

      {/* Payers */}
      {payingMembers.length > 0 && (
        <div className="card-glass space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            Paying ({payingMembers.length})
          </h3>
          <div className="space-y-2">
            {payingMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 glass-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-fire rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white font-medium">{member.name}</span>
                </div>
                <span className="text-fire-400 font-semibold">
                  ${(totalAmount / payingMembers.length).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlements */}
      {settlements.length > 0 ? (
        <div className="card-glass space-y-4">
          <h3 className="text-lg font-semibold text-white">Settlements Required</h3>
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div key={index} className="glass-dark rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {settlement.from.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white font-medium">{settlement.from}</span>
                  </div>
                  
                  <ArrowRightIcon className="w-5 h-5 text-white/40" />
                  
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{settlement.to}</span>
                    <div className="w-8 h-8 bg-gradient-fire rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {settlement.to.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-3">
                  <span className="text-2xl font-bold text-gradient">
                    ${settlement.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-glass text-center py-8">
          <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">All Settled!</h3>
          <p className="text-white/60">No additional payments needed</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={shareSettlements}
          className="w-full btn-primary flex items-center justify-center gap-3"
        >
          <ShareIcon className="w-5 h-5" />
          Share Summary
        </button>
        
        <button
          onClick={copySettlements}
          className="w-full btn-secondary flex items-center justify-center gap-3"
        >
          {copied ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className="w-5 h-5" />
              Copy Summary
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="flex-1 btn-secondary flex items-center justify-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Group
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          <HomeIcon className="w-5 h-5" />
          New Group
        </button>
      </div>

      {/* Tips */}
      <div className="card-glass space-y-3">
        <h3 className="text-lg font-semibold text-white">💡 Tips</h3>
        <div className="space-y-2 text-sm text-white/80">
          <p>• Take a screenshot of this summary for your records</p>
          <p>• Use payment apps like Venmo, PayPal, or Zelle for easy transfers</p>
          <p>• Keep the group code ({groupId}) to add more expenses later</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage; 