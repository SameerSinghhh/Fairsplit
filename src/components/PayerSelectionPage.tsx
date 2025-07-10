import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  CurrencyDollarIcon,
  ArrowRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Item {
  id: string;
  amount: number;
  description: string;
  members: string[];
}

interface GroupMember {
  id: string;
  name: string;
  items: Item[];
}

interface PayerSelection {
  memberId: string;
  isPaying: boolean;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const PayerSelectionPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [payerSelections, setPayerSelections] = useState<PayerSelection[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');

  useEffect(() => {
    const state = location.state as {
      members: GroupMember[];
      totalAmount: number;
      tax: string;
      tip: string;
    } | null;

    if (state) {
      setMembers(state.members);
      setTotalAmount(state.totalAmount);
      setTax(state.tax);
      setTip(state.tip);

      setPayerSelections(
        state.members.map((member) => ({
          memberId: member.id,
          isPaying: false,
        }))
      );
    } else {
      navigate(`/group/${groupId}`);
    }
  }, [location.state, groupId, navigate]);

  const togglePayer = (memberId: string) => {
    setPayerSelections((prev) =>
      prev.map((selection) =>
        selection.memberId === memberId
          ? { ...selection, isPaying: !selection.isPaying }
          : selection
      )
    );
  };

  const calculateSettlements = (): Settlement[] => {
    const settlements: Settlement[] = [];
    const payingMembers = payerSelections.filter((s) => s.isPaying);
    const nonPayingMembers = payerSelections.filter((s) => !s.isPaying);

    if (payingMembers.length === 0 || nonPayingMembers.length === 0) {
      return [];
    }

    const totalMealCost = members.reduce(
      (sum, member) =>
        sum + member.items.reduce((itemSum, item) => itemSum + item.amount, 0),
      0
    );

    let taxAmount = 0;
    let tipAmount = 0;

    if (tax.includes('%')) {
      taxAmount = ((parseFloat(tax) || 0) / 100) * totalMealCost;
    } else {
      taxAmount = parseFloat(tax) || 0;
    }

    if (tip.includes('%')) {
      tipAmount = ((parseFloat(tip) || 0) / 100) * totalMealCost;
    } else {
      tipAmount = parseFloat(tip) || 0;
    }

    const totalTaxAndTip = taxAmount + tipAmount;
    const taxAndTipPerPerson = totalTaxAndTip / members.length;
    const totalPaidPerPayer = totalAmount / payingMembers.length;

    const memberBalances = members.map((member) => {
      const memberMealCost = member.items.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const whatTheyOwe = memberMealCost + taxAndTipPerPerson;
      const isPaying = payerSelections.find(
        (s) => s.memberId === member.id
      )?.isPaying;
      const whatTheyPaid = isPaying ? totalPaidPerPayer : 0;
      const balance = whatTheyPaid - whatTheyOwe;

      return {
        name: member.name,
        balance: Number(balance.toFixed(2)),
      };
    });

    const creditors = memberBalances.filter((m) => m.balance > 0);
    const debtors = memberBalances.filter((m) => m.balance < 0);
    const totalOwedToCreditors = creditors.reduce(
      (sum, c) => sum + c.balance,
      0
    );

    debtors.forEach((debtor) => {
      const amountOwed = Math.abs(debtor.balance);

      creditors.forEach((creditor) => {
        const creditorShare = creditor.balance / totalOwedToCreditors;
        const amount = amountOwed * creditorShare;

        if (amount > 0.01) {
          settlements.push({
            from: debtor.name,
            to: creditor.name,
            amount: Number(amount.toFixed(2)),
          });
        }
      });
    });

    return settlements;
  };

  const handleContinue = () => {
    const selectedPayers = payerSelections.filter((selection) => selection.isPaying);
    if (selectedPayers.length === 0) return;

    const settlements = calculateSettlements();

    navigate(`/summary/${groupId}`, {
      state: {
        settlements,
        totalAmount,
        members,
        payerSelections,
      },
    });
  };

  const selectedPayersCount = payerSelections.filter(s => s.isPaying).length;
  const amountPerPayer = selectedPayersCount > 0 ? totalAmount / selectedPayersCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Who's Paying?</h1>
          <p className="text-white/60 text-sm">Select who will pay the bill</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Total Amount */}
      <div className="card-glass text-center">
        <div className="space-y-2">
          <CurrencyDollarIcon className="w-12 h-12 text-fire-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Total Amount</h3>
          <p className="text-4xl font-bold text-gradient">${totalAmount.toFixed(2)}</p>
          {selectedPayersCount > 0 && (
            <p className="text-white/60 text-sm">
              ${amountPerPayer.toFixed(2)} per payer
            </p>
          )}
        </div>
      </div>

      {/* Member Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Select Payers</h3>
        <div className="space-y-3">
          {members.map(member => {
            const memberTotal = member.items.reduce((sum, item) => sum + item.amount, 0);
            const isPaying = payerSelections.find(s => s.memberId === member.id)?.isPaying || false;

            // Calculate what they owe
            const totalMealCost = members.reduce(
              (sum, m) => sum + m.items.reduce((itemSum, item) => itemSum + item.amount, 0),
              0
            );

            let taxAmount = 0;
            let tipAmount = 0;

            if (tax.includes('%')) {
              taxAmount = ((parseFloat(tax) || 0) / 100) * totalMealCost;
            } else {
              taxAmount = parseFloat(tax) || 0;
            }

            if (tip.includes('%')) {
              tipAmount = ((parseFloat(tip) || 0) / 100) * totalMealCost;
            } else {
              tipAmount = parseFloat(tip) || 0;
            }

            const taxAndTipPerPerson = (taxAmount + tipAmount) / members.length;
            const whatTheyOwe = memberTotal + taxAndTipPerPerson;

            return (
              <div key={member.id} className="card-glass">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isPaying ? 'bg-gradient-fire' : 'bg-white/10'
                      }`}>
                        {isPaying ? (
                          <CheckCircleIcon className="w-6 h-6 text-white" />
                        ) : (
                          <UserIcon className="w-6 h-6 text-white/60" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{member.name}</h4>
                      <p className="text-white/60 text-sm">
                        Owes: ${whatTheyOwe.toFixed(2)}
                      </p>
                      {member.items.length > 0 && (
                        <p className="text-white/40 text-xs">
                          {member.items.length} item{member.items.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => togglePayer(member.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isPaying
                        ? 'bg-gradient-fire text-white shadow-lg'
                        : 'btn-secondary text-sm'
                    }`}
                  >
                    {isPaying ? 'Paying' : 'Select'}
                  </button>
                </div>

                {/* Show member's items */}
                {member.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      {member.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-white/80">{item.description}</span>
                          <span className="text-fire-400 font-medium">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {selectedPayersCount > 0 && (
        <div className="card-glass space-y-4">
          <h3 className="text-lg font-semibold text-white">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-white/80">
              <span>Selected payers:</span>
              <span>{selectedPayersCount}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Amount per payer:</span>
              <span>${amountPerPayer.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-2">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total:</span>
                <span className="text-gradient">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="sticky bottom-0 pt-4">
        <button
          onClick={handleContinue}
          disabled={selectedPayersCount === 0}
          className="w-full btn-primary flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Summary
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default PayerSelectionPage;
