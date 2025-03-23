import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

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
    if (payerSelections.some((selection) => selection.isPaying)) {
      const settlements = calculateSettlements();

      navigate(`/summary/${groupId}`, {
        state: {
          settlements,
          totalAmount,
        },
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Select Who's Paying</h2>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700"
          >
            Leave Group
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Total Amount</h3>
          <p className="text-3xl font-bold text-primary-600">
            ${totalAmount.toFixed(2)}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {members.map(member => {
            const memberTotal = member.items.reduce((sum, item) => sum + item.amount, 0);
            const isPaying = payerSelections.find(s => s.memberId === member.id)?.isPaying || false;

            // Calculate tax and tip amounts
            let taxAmount = 0;
            let tipAmount = 0;

            // Handle tax calculation
            if (tax.includes('%')) {
              taxAmount = (parseFloat(tax) || 0) / 100 * memberTotal;
            } else {
              taxAmount = parseFloat(tax) || 0;
            }

            // Handle tip calculation
            if (tip.includes('%')) {
              tipAmount = (parseFloat(tip) || 0) / 100 * memberTotal;
            } else {
              tipAmount = parseFloat(tip) || 0;
            }

            // Calculate total including their share of tax and tip
            const totalWithTaxAndTip = memberTotal + (taxAmount + tipAmount) / members.length;

            return (
              <div
                key={member.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => togglePayer(member.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <div className="text-sm text-gray-600">
                      {member.items.map(item => (
                        <div key={item.id}>
                          {item.description}: ${item.amount.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      Total: ${totalWithTaxAndTip.toFixed(2)}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isPaying
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {isPaying && '✓'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Continue to Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayerSelectionPage;
