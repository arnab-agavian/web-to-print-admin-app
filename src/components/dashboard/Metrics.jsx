import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, FileCheck2, Layers3, RefreshCw, ShoppingBag } from 'lucide-react';
import { revenueData } from '../../adminData';
import { money } from '../../utils/formatters';

export default function Metrics({ orders, analytics, status, error, onRetry }) {
  const active = analytics?.orders ?? orders.filter((item) => !['completed', 'archived', 'quote'].includes(item.status)).length;
  const proofs = analytics?.awaitingProof ?? orders.filter((item) => ['proof_ready', 'awaiting_approval', 'changes_requested'].includes(item.status)).length;
  const production = analytics?.inProduction ?? orders.filter((item) => ['approved', 'files_ready', 'production_queue', 'manufacturing'].includes(item.status)).length;
  const urgentProduction = orders.filter((item) => ['approved', 'files_ready', 'production_queue', 'manufacturing'].includes(item.status) && item.priority === 'Urgent').length;
  const revenue = analytics?.revenue ?? orders.filter((item) => item.status !== 'quote').reduce((sum, item) => sum + item.total, 0);
  return (
    <section className="metric-grid">
      <article className="metric-card"><span>Orders <ShoppingBag /></span><div><b>{active}</b><em>{status === 'loading' ? 'Syncing' : 'Live'}</em></div><small>Across the admin production queue</small></article>
      <article className="metric-card"><span>In production <Layers3 /></span><div><b>{production}</b><em>{urgentProduction} urgent</em></div><small>Approved or being manufactured</small></article>
      <article className="metric-card"><span>Proof actions <FileCheck2 /></span><div><b>{proofs}</b><em className="warm">Action needed</em></div><small>Review feedback and approvals</small></article>
      <article className="metric-card revenue-card"><div><span>Managed order value</span><b>{money(revenue)}</b><small>+12.8% from last period</small></div><ResponsiveContainer width="48%" height={88}><AreaChart data={revenueData}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9f227" stopOpacity=".55" /><stop offset="1" stopColor="#b9f227" stopOpacity="0" /></linearGradient></defs><Area type="monotone" dataKey="revenue" stroke="#94c913" fill="url(#revenueFill)" strokeWidth={2} /><Tooltip formatter={(value) => money(value)} contentStyle={{ fontSize: 11 }} /></AreaChart></ResponsiveContainer></article>
      {error && <div className="analytics-error" role="alert"><AlertCircle />{error}<button type="button" onClick={onRetry}><RefreshCw />Retry</button></div>}
    </section>
  );
}
