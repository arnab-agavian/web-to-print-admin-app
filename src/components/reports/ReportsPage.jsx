import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { revenueData } from '../../adminData';
import { money, statusLabel } from '../../utils/formatters';
import PageHeading from '../layout/PageHeading';

export default function ReportsPage({ orders }) {
  const completedValue = orders.filter((item) => ['completed', 'archived'].includes(item.status)).reduce((sum, item) => sum + item.total, 0);
  const productionValue = orders.filter((item) => !['quote', 'archived'].includes(item.status)).reduce((sum, item) => sum + item.total, 0);
  const exportReport = () => {
    const rows = [['Job', 'Customer', 'Product', 'Status', 'Quantity', 'Value'], ...orders.map((item) => [item.id, item.customer, item.product, statusLabel(item.status), item.qty, item.total])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'digital-heroes-order-report.csv'; anchor.click(); URL.revokeObjectURL(url);
  };
  return <><PageHeading eyebrow="REPORTS & ANALYTICS" title="Production intelligence." description="Order value, throughput and approval performance." action={<button className="secondary-button" onClick={exportReport}><Download />Export report</button>} /><section className="report-metrics"><article><span>Weekly revenue</span><b>{money(revenueData.reduce((sum, day) => sum + day.revenue, 0))}</b><em>+12.8%</em></article><article><span>Active order value</span><b>{money(productionValue)}</b><small>Across the live pipeline</small></article><article><span>Completed value</span><b>{money(completedValue)}</b><small>Ready or already archived</small></article><article><span>Proof approval rate</span><b>86%</b><em>+4.2%</em></article></section><section className="report-grid"><article className="panel chart-panel"><div className="section-title"><div><h2>Revenue trend</h2><p>Last seven production days</p></div></div><ResponsiveContainer width="100%" height={300}><AreaChart data={revenueData}><defs><linearGradient id="bigRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff5c35" stopOpacity=".25" /><stop offset="1" stopColor="#ff5c35" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#ecece8" /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} /><Tooltip formatter={(value) => money(value)} /><Area type="monotone" dataKey="revenue" stroke="#ff5c35" fill="url(#bigRevenue)" strokeWidth={3} /></AreaChart></ResponsiveContainer></article><article className="panel chart-panel"><div className="section-title"><div><h2>Orders by day</h2><p>New studio demand</p></div></div><ResponsiveContainer width="100%" height={300}><BarChart data={revenueData}><CartesianGrid vertical={false} stroke="#ecece8" /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="orders" fill="#17191d" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></article></section></>;
}
