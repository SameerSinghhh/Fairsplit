import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const SummaryPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Get the calculated data from the location state
    const state = location.state as {
      settlements: Settlement[];
      totalAmount: number;
    } | null;

    if (state) {
      setSettlements(state.settlements);
      setTotalAmount(state.totalAmount);
    } else {
      // If no state is available, redirect back to the group page
      navigate(`/group/${groupId}`);
    }
  }, [location.state, groupId, navigate]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment Summary</h2>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700"
          >
            Start New Group
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Total Amount</h3>
          <p className="text-3xl font-bold text-primary-600">
            ${totalAmount.toFixed(2)}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Settlements</h3>
          <div className="space-y-2">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-primary-50 rounded-md"
              >
                <span className="font-medium">
                  {settlement.from} → {settlement.to}
                </span>
                <span className="font-semibold text-primary-600">
                  ${settlement.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage; 