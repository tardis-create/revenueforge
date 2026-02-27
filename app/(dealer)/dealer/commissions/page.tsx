'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Commission { id: string; leadId: string; product: string; customer: string; amount: number; status: 'pending' | 'approved' | 'paid'; date: string; paidDate?: string; }

export default function DealerCommissionsPage() {
  const { isAuthenticated } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://revenueforge-api.pronitopenclaw.workers.dev';
        const response = await fetch(`${API_BASE}/api/dealer/commissions`, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
        if (response.ok) { const data = await response.json(); setCommissions(data.commissions || []); }
        else setCommissions(getMockCommissions());
      } catch { setCommissions(getMockCommissions()); }
      finally { setIsLoading(false); }
    };
    fetchCommissions();
  }, [isAuthenticated]);

  const getMockCommissions = (): Commission[] => [
    { id: 'COM-001', leadId: 'LEAD-004', product: 'Predictive Analytics Module', customer: 'InnovateTech', amount: 5100, status: 'paid', date: '2026-02-24', paidDate: '2026-02-28' },
    { id: 'COM-002', leadId: 'LEAD-006', product: 'Customer Insights Dashboard', customer: 'RetailMax', amount: 3000, status: 'paid', date: '2026-02-21', paidDate: '2026-02-25' },
    { id: 'COM-003', leadId: 'LEAD-001', product: 'Enterprise Analytics Suite', customer: 'TechCorp Inc.', amount: 4500, status: 'approved', date: '2026-02-27' },
    { id: 'COM-004', leadId: 'LEAD-002', product: 'Revenue Intelligence Platform', customer: 'GrowthLabs', amount: 3200, status: 'pending', date: '2026-02-26' },
    { id: 'COM-005', leadId: 'LEAD-003', product: 'Smart Automation Tools', customer: 'DataDriven Co.', amount: 2800, status: 'pending', date: '2026-02-25' },
  ];

  const getStatusColor = (status: string) => { switch (status) { case 'paid': return 'bg-green-100 text-green-800'; case 'approved': return 'bg-blue-100 text-blue-800'; case 'pending': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-zinc-100 text-zinc-800'; } };
  const filteredCommissions = commissions.filter(c => selectedStatus === 'all' || c.status === selectedStatus);
  const stats = { totalEarned: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0), pendingPayment: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0), awaitingApproval: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) };

  if (isLoading) return <div className="max-w-7xl mx-auto"><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900"></div></div></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl font-bold text-zinc-900">Commissions</h1><p className="text-zinc-600 mt-1">Track your earnings and payout history</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"><div className="text-3xl font-bold">${stats.totalEarned.toLocaleString()}</div><div className="text-sm text-green-100">Total Earned</div></div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6"><div className="text-2xl font-bold text-zinc-900">${stats.pendingPayment.toLocaleString()}</div><div className="text-sm text-zinc-600">Pending Payment</div></div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6"><div className="text-2xl font-bold text-zinc-900">${stats.awaitingApproval.toLocaleString()}</div><div className="text-sm text-zinc-600">Awaiting Approval</div></div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6"><div className="text-2xl font-bold text-zinc-900">${commissions.length > 0 ? Math.round(commissions.reduce((s,c) => s + c.amount, 0) / commissions.length).toLocaleString() : 0}</div><div className="text-sm text-zinc-600">Average Per Deal</div></div>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-4"><div className="flex gap-2">{['all', 'pending', 'approved', 'paid'].map((status) => (<button key={status} onClick={() => setSelectedStatus(status)} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedStatus === status ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>))}</div></div>
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden"><table className="w-full"><thead className="bg-zinc-50 border-b border-zinc-200"><tr><th className="text-left text-xs font-medium text-zinc-600 uppercase px-6 py-3">Commission</th><th className="text-left text-xs font-medium text-zinc-600 uppercase px-6 py-3">Product</th><th className="text-left text-xs font-medium text-zinc-600 uppercase px-6 py-3">Status</th><th className="text-right text-xs font-medium text-zinc-600 uppercase px-6 py-3">Amount</th></tr></thead><tbody className="divide-y divide-zinc-200">
        {filteredCommissions.map((commission) => (<tr key={commission.id} className="hover:bg-zinc-50"><td className="px-6 py-4"><div className="text-sm font-medium text-zinc-900">{commission.id}</div><div className="text-xs text-zinc-500">Lead: {commission.leadId} · {commission.date}</div></td><td className="px-6 py-4 text-sm text-zinc-700">{commission.product}</td><td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(commission.status)}`}>{commission.status}</span>{commission.paidDate && <div className="text-xs text-zinc-500 mt-1">Paid: {commission.paidDate}</div>}</td><td className="px-6 py-4 text-right text-sm font-semibold text-green-600">${commission.amount.toLocaleString()}</td></tr>))}
      </tbody></table></div>
    </div>
  );
}
