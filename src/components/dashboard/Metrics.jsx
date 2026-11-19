import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FileCheck2, Layers3, ShoppingBag } from 'lucide-react';
import { revenueData } from '../../adminData';
import { money } from '../../utils/formatters';

export default function Metrics({ orders }) {
  const active = orders.filter((item) => !['completed', 'archived', 'quote'].includes(item.status));
  const proofs = orders.filter((item) => ['proof_ready', 'awaiting_approval', 'changes_requested'].includes(item.status));
  const production = orders.filter((item) => ['approved', 'files_ready', 'production_queue', 'manufacturing'].includes(item.status));
  const revenue = orders.filter((item) => item.status !== 'quote').reduce((sum, item) => sum + item.total, 0);
  return (
    <section className="metric-grid">
      <article className="metric-card"><span>Active orders <ShoppingBag /></span><div><b>{active.length}</b><em>Live</em></div><small>Across artwork and production</small></article>
      <article className="metric-card"><span>In production <Layers3 /></span><div><b>{production.length}</b><em>{production.filter((item) => item.priority === 'Urgent').length} urgent</em></div><small>Approved or being manufactured</small></article>
      <article className="metric-card"><span>Proof actions <FileCheck2 /></span><div><b>{proofs.length}</b><em className="warm">Action needed</em></div><small>Review feedback and approvals</small></article>
      <article className="metric-card revenue-card"><div><span>Managed order value</span><b>{money(revenue)}</b><small>+12.8% from last period</small></div><ResponsiveContainer width="48%" height={88}><AreaChart data={revenueData}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9f227" stopOpacity=".55" /><stop offset="1" stopColor="#b9f227" stopOpacity="0" /></linearGradient></defs><Area type="monotone" dataKey="revenue" stroke="#94c913" fill="url(#revenueFill)" strokeWidth={2} /><Tooltip formatter={(value) => money(value)} contentStyle={{ fontSize: 11 }} /></AreaChart></ResponsiveContainer></article>
    </section>
  );
}
