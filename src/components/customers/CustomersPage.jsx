import React from 'react';
import { AlertCircle, ChevronRight, LoaderCircle, Mail, Phone, RefreshCw, Search, UsersRound } from 'lucide-react';
import PageHeading from '../layout/PageHeading';
import { money } from '../../utils/formatters';

export default function CustomersPage({ customers, status, error, onRetry, search, onViewOrders }) {
  const query = search.trim().toLowerCase();
  const filtered = customers.filter((customer) => (
    `${customer.name} ${customer.email} ${customer.company} ${customer.phone}`.toLowerCase().includes(query)
  ));

  let content;
  if (status === 'loading' && !customers.length) {
    content = <section className="table-panel product-state" role="status"><LoaderCircle className="spin" /><b>Loading customers</b><span>Fetching customer contacts and order totals…</span></section>;
  } else if (error && !customers.length) {
    content = <section className="table-panel product-state product-state-error" role="alert"><AlertCircle /><b>Could not load customers</b><span>{error}</span><button className="secondary-button" onClick={onRetry}><RefreshCw />Try again</button></section>;
  } else if (!customers.length) {
    content = <section className="table-panel product-state"><UsersRound /><b>No customers yet</b><span>Customers who place orders will appear here.</span></section>;
  } else if (!filtered.length) {
    content = <section className="table-panel product-state"><Search /><b>No customers found</b><span>Try another name, email, company, or phone number.</span></section>;
  } else {
    content = <section className="customer-grid">{filtered.map((customer) => <article className="customer-card" key={customer.id}><div className="avatar">{customer.name.split(' ').map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}</div><div className="customer-main"><span>{customer.company || customer.id}</span><h3>{customer.name}</h3><p>{customer.contact}</p>{customer.email && <a href={`mailto:${customer.email}`}><Mail />{customer.email}</a>}{customer.phone && <a href={`tel:${customer.phone}`}><Phone />{customer.phone}</a>}</div><div className="customer-stats"><div><b>{customer.orders}</b><small>orders</small></div><div><b>{money(customer.spend)}</b><small>lifetime value</small></div></div><button onClick={() => onViewOrders(customer.name)}>View {customer.jobsLeft} active {customer.jobsLeft === 1 ? 'job' : 'jobs'} <ChevronRight /></button></article>)}</section>;
  }

  return <><PageHeading eyebrow="CUSTOMER DIRECTORY" title="Manage customers." description="Contacts, order history, active jobs and lifetime value." />{content}</>;
}
