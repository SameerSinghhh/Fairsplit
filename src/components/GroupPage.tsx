import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      setMembers([
        ...members,
        {
          id: Date.now().toString(),
          name: newMemberName.trim(),
          items: [],
        },
      ]);
      setNewMemberName('');
    }
  };

  const removeMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  const addItem = (memberId: string, amount: number, description: string) => {
    setMembers(members.map(member =>
      member.id === memberId ? {
        ...member,
        items: [...member.items, {
          id: Date.now().toString(),
          amount,
          description,
          members: [member.id]
        }]
      } : member
    ));
  };

  const removeItem = (itemId: string) => {
    setMembers(members.map(member => ({
      ...member,
      items: member.items.filter(item => item.id !== itemId)
    })));
  };

  const calculateTotal = () => {
    const itemsTotal = members.reduce((sum, member) => 
      sum + member.items.reduce((memberSum, item) => memberSum + item.amount, 0), 0);
    
    const taxAmount = tax ? (tax.includes('%') ? itemsTotal * parseFloat(tax) / 100 : parseFloat(tax)) : 0;
    const tipAmount = tip ? (tip.includes('%') ? itemsTotal * parseFloat(tip) / 100 : parseFloat(tip)) : 0;
    
    return itemsTotal + taxAmount + tipAmount;
  };

  const handleCalculate = () => {
    navigate(`/payer-selection/${groupId}`, {
      state: {
        members,
        totalAmount: calculateTotal(),
        tax,
        tip
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Group: {groupId}</h2>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700"
          >
            Leave Group
          </button>
        </div>

        <form onSubmit={addMember} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Enter member name"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Add Member
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {members.map(member => (
            <div key={member.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{member.name}</h3>
              <div className="space-y-2">
                {member.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.description}</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
                    const description = (form.elements.namedItem('description') as HTMLInputElement).value;
                    if (amount && description) {
                      addItem(member.id, amount, description);
                      form.reset();
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="description"
                    placeholder="Item"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    step="0.01"
                    className="w-32 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    Add Item
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax</label>
            <input
              type="text"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder="Amount or %"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tip</label>
            <input
              type="text"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="Amount or %"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-xl font-semibold">
            Total: ${calculateTotal().toFixed(2)}
          </div>
          <button
            onClick={handleCalculate}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Calculate Split
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupPage; 