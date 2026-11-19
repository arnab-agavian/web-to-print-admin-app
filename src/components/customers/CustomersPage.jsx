import React from 'react';
import { ChevronRight, Mail } from 'lucide-react';
import PageHeading from '../layout/PageHeading';
import { money } from '../../utils/formatters';

export default function CustomersPage({ customers, orders, onViewOrders }) {
  return <><PageHeading eyebrow="CUSTOMER DIRECTORY" title="Manage customers." description="Contacts, order history and lifetime value." /><section className="customer-grid">{customers.map((customer) => <article className="customer-card" key={customer.id}><div className="avatar">{customer.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="customer-main"><span>{customer.id}</span><h3>{customer.name}</h3><p>{customer.contact}</p><a href={`mailto:${customer.email}`}><Mail />{customer.email}</a></div><div className="customer-stats"><div><b>{customer.orders}</b><small>orders</small></div><div><b>{money(customer.spend)}</b><small>lifetime value</small></div></div><button onClick={() => onViewOrders(customer.name)}>View {orders.filter((order) => order.customerId === customer.id).length} active jobs <ChevronRight /></button></article>)}</section></>;
}
