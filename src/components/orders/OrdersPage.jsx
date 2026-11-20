import React, { useState } from 'react';
import { ChevronRight, Filter, Search } from 'lucide-react';
import { workflow } from '../../adminData';
import { money, statusLabel } from '../../utils/formatters';
import PageHeading from '../layout/PageHeading';
import StatusPill from '../ui/StatusPill';
import { AppCompactSelect, AppSearchInput } from '../ui/AppFields';

export default function OrdersPage({ title = 'Job database.', description = 'Search, filter and open every quote and production job.', orders, search, setSearch, onOpen, subset }) {
  const [filter, setFilter] = useState('All statuses');
  const relevant = subset ? orders.filter(subset) : orders;
  const filtered = relevant.filter((order) => `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All statuses' || statusLabel(order.status) === filter));
  const statusOptions = ['All statuses', ...workflow.map((item) => item.label)];
  return <><PageHeading eyebrow="MANAGE ORDERS" title={title} description={description} /><section className="table-panel"><div className="table-toolbar"><div className="local-search"><Search /><AppSearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search job ID, customer or product" inputProps={{ 'aria-label': 'Search orders' }} /></div><div className="select-wrap"><Filter /><AppCompactSelect value={filter} onChange={(event) => setFilter(event.target.value)} options={statusOptions} inputProps={{ 'aria-label': 'Filter by status' }} /></div></div><div className="table-scroll"><table><thead><tr><th>Job</th><th>Customer</th><th>Product</th><th>Status</th><th>Due date</th><th>Value</th><th /></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} onClick={() => onOpen(order.id)}><td><b>{order.id}</b><small>{order.priority} priority</small></td><td>{order.customer}</td><td>{order.product}<small>{order.qty} units</small></td><td><StatusPill status={order.status} /></td><td>{order.due}</td><td><b>{money(order.total)}</b></td><td><button aria-label={`Open ${order.id}`}><ChevronRight /></button></td></tr>)}{!filtered.length && <tr><td colSpan="7"><div className="empty-table"><Search /><b>No jobs found</b><span>Try another search or status filter.</span></div></td></tr>}</tbody></table></div></section></>;
}
