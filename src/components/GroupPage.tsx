import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon, 
  TrashIcon, 
  PlusIcon, 
  CalculatorIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  CheckIcon
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

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyGroupCode = async () => {
    if (groupId) {
      try {
        await navigator.clipboard.writeText(groupId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

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
      setShowAddMember(false);
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

  const calculateSubtotal = () => {
    return members.reduce((sum, member) => 
      sum + member.items.reduce((memberSum, item) => memberSum + item.amount, 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = tax ? (tax.includes('%') ? subtotal * parseFloat(tax) / 100 : parseFloat(tax)) : 0;
    const tipAmount = tip ? (tip.includes('%') ? subtotal * parseFloat(tip) / 100 : parseFloat(tip)) : 0;
    return subtotal + taxAmount + tipAmount;
  };

  const handleCalculate = () => {
    if (members.length === 0) return;
    
    navigate(`/payer-selection/${groupId}`, {
      state: {
        members,
        totalAmount: calculateTotal(),
        tax,
        tip
      }
    });
  };

  const MemberCard = ({ member }: { member: GroupMember }) => {
    const [showAddItem, setShowAddItem] = useState(false);
    const [itemAmount, setItemAmount] = useState('');
    const [itemDescription, setItemDescription] = useState('');

    const handleAddItem = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(itemAmount);
      if (amount > 0 && itemDescription.trim()) {
        addItem(member.id, amount, itemDescription.trim());
        setItemAmount('');
        setItemDescription('');
        setShowAddItem(false);
      }
    };

    const memberTotal = member.items.reduce((sum, item) => sum + item.amount, 0);

    return (
      <div className="card-glass space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-fire rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{member.name}</h3>
              <p className="text-white/60 text-sm">${memberTotal.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => removeMember(member.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {member.items.length > 0 && (
          <div className="space-y-2">
            {member.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 glass-dark rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">{item.description}</p>
                  <p className="text-fire-400 font-semibold">${item.amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!showAddItem ? (
          <button
            onClick={() => setShowAddItem(true)}
            className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Item
          </button>
        ) : (
          <form onSubmit={handleAddItem} className="space-y-3">
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Item description"
              className="w-full input-glass text-sm"
              autoFocus
            />
            <input
              type="number"
              value={itemAmount}
              onChange={(e) => setItemAmount(e.target.value)}
              placeholder="Amount"
              step="0.01"
              min="0"
              className="w-full input-glass text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddItem(false);
                  setItemAmount('');
                  setItemDescription('');
                }}
                className="flex-1 btn-secondary text-sm py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!itemAmount || !itemDescription.trim()}
                className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Group Split</h1>
          <button
            onClick={copyGroupCode}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mt-1"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4" />
                Code: {groupId}
              </>
            )}
          </button>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Members ({members.length})</h2>
          {!showAddMember && (
            <button
              onClick={() => setShowAddMember(true)}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
              <UserPlusIcon className="w-4 h-4" />
              Add Member
            </button>
          )}
        </div>

        {showAddMember && (
          <form onSubmit={addMember} className="card-glass">
            <div className="space-y-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Member name"
                className="w-full input-glass"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberName('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newMemberName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Member
                </button>
              </div>
            </div>
          </form>
        )}

        {members.length === 0 ? (
          <div className="card-glass text-center py-8">
            <UserPlusIcon className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60">No members yet</p>
            <p className="text-white/40 text-sm">Add members to start splitting expenses</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>

      {/* Tax and Tip */}
      {members.length > 0 && (
        <div className="card-glass space-y-4">
          <h3 className="text-lg font-semibold text-white">Additional Charges</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">Tax</label>
              <input
                type="text"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="10% or 5.50"
                className="w-full input-glass text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">Tip</label>
              <input
                type="text"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="15% or 8.00"
                className="w-full input-glass text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {members.length > 0 && (
        <div className="card-glass space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-white/80">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            {tax && (
              <div className="flex justify-between text-white/80">
                <span>Tax:</span>
                <span>${(tax.includes('%') ? calculateSubtotal() * parseFloat(tax) / 100 : parseFloat(tax) || 0).toFixed(2)}</span>
              </div>
            )}
            {tip && (
              <div className="flex justify-between text-white/80">
                <span>Tip:</span>
                <span>${(tip.includes('%') ? calculateSubtotal() * parseFloat(tip) / 100 : parseFloat(tip) || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2">
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total:</span>
                <span className="text-gradient">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCalculate}
            disabled={members.length === 0 || calculateTotal() === 0}
            className="w-full btn-primary flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CalculatorIcon className="w-6 h-6" />
            Calculate Split
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupPage; 