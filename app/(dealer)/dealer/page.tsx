'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Lead {
  id: string;
  customerName: string;
  company: string;
  product: string;
  value: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  commission: number;
  lastActivity: string;
}

interface DashboardStats {
  totalLeads: number;
  wonLeads: number;
  totalCommission: number;
  pendingCommission: number;
  conversionRate: number;
  activeLeads: number;
}

export default function DealerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalLeads: 0, wonLeads: 0, totalCommission: 0, pendingCommission: 0, conversionRate: 0, activeLeads: 0 });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://revenueforge-api.pronitopenclaw.workers.dev';
        const response = await fetch(`${API_BASE}/api/dealer/leads`, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
        if (response.ok) { const data = await response.json(); setLeads(data.leads || []); setStats(data.stats || calculateStats(data.leads || [])); }
        else { const mockLeads = getMockLeads(); setLeads(mockLeads); setStats(calculateStats(mockLeads)); }
      } catch { const mockLeads = getMockLeads(); setLeads(mockLeads); setStats(calculateStats(mockLeads)); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [isAuthenticated]);

  const calculateStats = (leadList: Lead[]): DashboardStats => {
    const totalLeads = leadList.length;
    const wonLeads = leadList.filter(l => l.status === 'won').length;
    const activeStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
    const activeLeads = leadList.filter(l => activeStatuses.includes(l.status)).length;
    const totalCommission = leadList.filter(l => l.status === 'won').reduce((sum, l) => sum + l.commission, 0);
    const pendingCommission = leadList.filter(l => ['proposal', 'negotiation'].includes(l.status)).reduce((sum, l) => sum + l.commission, 0);
    return { totalLeads, wonLeads, totalCommission, pendingCommission, conversionRate: totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0, activeLeads };
  };

  const getMockLeads = (): Lead[] => [
    { id: 'LEAD-001', customerName: 'John Smith', company: 'TechCorp Inc.', product: 'Enterprise Analytics Suite', value: 45000, status: 'negotiation', commission: 4500, lastActivity: '2026-02-27' },
    { id: 'LEAD-002', customerName: 'Sarah Johnson', company: 'GrowthLabs', product: 'Revenue Intelligence Platform', value: 32000, status: 'proposal', commission: 3200, lastActivity: '2026-02-26' },
    { id: 'LEAD-003', customerName: 'Mike Chen', company: 'DataDriven Co.', product: 'Smart Automation Tools', value: 28000, status: 'qualified', commission: 2800, lastActivity: '2026-02-25' },
    { id: 'LEAD-004', customerName: 'Emily Davis', company: 'InnovateTech', product: 'Predictive Analytics Module', value: 51000, status: 'won', commission: 5100, lastActivity: '2026-02-24' },
    { id: 'LEAD-005', customerName: 'Alex Thompson', company: 'StartupXYZ', product: 'Team Collaboration Suite', value: 19000, status: 'contacted', commission: 1900, lastActivity: '2026-02-23' },
    { id: 'LEAD-006', customerName: 'Lisa Wang', company: 'RetailMax', product: 'Customer Insights Dashboard', value: 30000, status: 'won', commission: 3000, lastActivity: '2026-02-21' },
  ];

  const handleStatusUpdate = async (leadId: string, newStatus: Lead['status']) => {
    setUpdatingLeadId(leadId);
    try {
      const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
      setLeads(updatedLeads); setStats(calculateStats(updatedLeads));
    } finally { setUpdatingLeadId(null); }
  };

  const getStatusColor = (status: string) => {
    switch (status) { case 'won': return 'bg-green-100 text-green-800 border-green-200'; case 'lost': return 'bg-red-100 text-red-800 border-red-200'; case 'negotiation': return 'bg-purple-100 text-purple-800 border-purple-200'; case 'proposal': return 'bg-blue-100 text-blue-800 border-blue-200'; case 'qualified': return 'bg-cyan-100 text-cyan-800 border-cyan-200'; case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; default: return 'bg-zinc-100 text-zinc-800 border-zinc-200'; }
  };

  if (authLoading || isLoading) return <div className="max-w-7xl mx-auto"><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900"></div></div></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1><p className="text-zinc-600 mt-1">Welcome back{user?.name ? `, ${user.name}` : ''}! Here&apos;s your lead pipeline overview.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-zinc-200 p-6"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><span className="text-2xl">📋</span></div></div><div className="text-3xl font-bold text-zinc-900">{stats.totalLeads}</div><div className="text-sm text-zinc-600">Total Leads</div></div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><span className="text-2xl">✅</span></div></div><div className="text-3xl font-bold text-zinc-900">{stats.wonLeads}</div><div className="text-sm text-zinc-600">Won Leads</div></div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><span className="text-2xl">💰</span></div></div><div className="text-3xl font-bold">${stats.totalCommission.toLocaleString()}</div><div className="text-sm text-green-100">Total Commission</div></div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-2xl">⏳</span></div></div><div className="text-3xl font-bold text-zinc-900">${stats.pendingCommission.toLocaleString()}</div><div className="text-sm text-zinc-600">Pending Commission</div></div>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-200"><h2 className="text-lg font-semibold text-zinc-900">Your Leads</h2><p className="text-sm text-zinc-500 mt-1">{stats.activeLeads} active · {stats.wonLeads} won</p></div>
        <div className="overflow-x-auto"><table className="w-full"><thead className="bg-zinc-50 border-b border-zinc-200"><tr><th className="text-left text-xs font-medium text-zinc-600 uppercase px-6 py-3">Lead</th><th className="text-left text-xs font-medium text-zinc-600 uppercase px-6 py-3 hidden md:table-cell">Product</th><th className="text-left text-xs font-medium text-zinc-600 uppercase px-6 py-3">Status</th><th className="text-right text-xs font-medium text-zinc-600 uppercase px-6 py-3">Value</th></tr></thead><tbody className="divide-y divide-zinc-200">
          {leads.map((lead) => (<tr key={lead.id} className="hover:bg-zinc-50"><td className="px-6 py-4"><div className="text-sm font-medium text-zinc-900">{lead.customerName}</div><div className="text-xs text-zinc-500">{lead.company}</div></td><td className="px-6 py-4 hidden md:table-cell"><div className="text-sm text-zinc-700 max-w-[200px] truncate">{lead.product}</div><div className="text-xs text-zinc-400">{lead.lastActivity}</div></td><td className="px-6 py-4"><select value={lead.status} onChange={(e) => handleStatusUpdate(lead.id, e.target.value as Lead['status'])} disabled={updatingLeadId === lead.id} className={`text-xs font-medium px-3 py-1.5 rounded-full border ${getStatusColor(lead.status)} ${updatingLeadId === lead.id ? 'opacity-50' : ''}`}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="negotiation">Negotiation</option><option value="won">Won</option><option value="lost">Lost</option></select></td><td className="px-6 py-4 text-right"><div className="text-sm font-semibold text-zinc-900">${lead.value.toLocaleString()}</div>{lead.status === 'won' && <div className="text-xs text-green-600">+${lead.commission.toLocaleString()} commission</div>}</td></tr>))}
        </tbody></table></div>
      </div>
    </div>
  );
}
