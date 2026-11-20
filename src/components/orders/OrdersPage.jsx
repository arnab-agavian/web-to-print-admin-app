import React, { useState } from 'react';
import { AlertCircle, ChevronRight, Filter, LoaderCircle, PackageOpen, RefreshCw, Search } from 'lucide-react';
import { workflow } from '../../adminData';
import { money, statusLabel } from '../../utils/formatters';
import PageHeading from '../layout/PageHeading';
import { AppCompactSelect, AppSearchInput } from '../ui/AppFields';
import StatusPill from '../ui/StatusPill';

export default function OrdersPage({
  title = 'Job database.',
  description = 'Search, filter and open every quote and production job.',
  orders,
  status,
  error,
  onRetry,
  search,
  setSearch,
  onOpen,
  subset,
}) {
  const [filter, setFilter] = useState('All statuses');
  const relevant = subset ? orders.filter(subset) : orders;
  const filtered = relevant.filter((order) => (
    `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(search.toLowerCase())
    && (filter === 'All statuses' || statusLabel(order.status) === filter)
  ));
  const statusOptions = ['All statuses', ...workflow.map((item) => item.label)];

  let content;
  if (status === 'loading' && !orders.length) {
    content = <section className="table-panel product-state" role="status"><LoaderCircle className="spin" /><b>Loading orders</b><span>Fetching the latest jobs…</span></section>;
  } else if (error && !orders.length) {
    content = <section className="table-panel product-state product-state-error" role="alert"><AlertCircle /><b>Could not load orders</b><span>{error}</span><button className="secondary-button" onClick={onRetry}><RefreshCw />Try again</button></section>;
  } else if (!orders.length) {
    content = <section className="table-panel product-state"><PackageOpen /><b>No orders yet</b><span>New orders will appear here.</span></section>;
  } else {
    content = (
      <section className="table-panel">
        <div className="table-toolbar">
          <div className="local-search"><Search /><AppSearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search job ID, customer or product" inputProps={{ 'aria-label': 'Search orders' }} /></div>
          <div className="select-wrap"><Filter /><AppCompactSelect value={filter} onChange={(event) => setFilter(event.target.value)} options={statusOptions} inputProps={{ 'aria-label': 'Filter by status' }} /></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Job</th><th>Customer</th><th>Product</th><th>Status</th><th>Due date</th><th>Value</th><th /></tr></thead>
            <tbody>
              {filtered.map((order) => <tr key={order.id} onClick={() => onOpen(order.id)}><td><b>{order.id}</b><small>{order.priority} priority</small></td><td>{order.customer}</td><td>{order.product}<small>{order.qty} units</small></td><td><StatusPill status={order.status} /></td><td>{order.due}</td><td><b>{money(order.total)}</b></td><td><button aria-label={`Open ${order.id}`}><ChevronRight /></button></td></tr>)}
              {!filtered.length && <tr><td colSpan="7"><div className="empty-table"><Search /><b>No jobs found</b><span>Try another search or status filter.</span></div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return <><PageHeading eyebrow="MANAGE ORDERS" title={title} description={description} />{content}</>;
}
