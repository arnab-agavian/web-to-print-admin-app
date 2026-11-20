import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AppSelectField, AppTextField } from '../ui/AppFields';

export default function NewOrderModal({ customers, products, onClose, onCreate }) {
  const [form, setForm] = useState({ customerId: customers[0]?.id || '', productId: products[0]?.id || '', qty: 100, due: '27 Nov 2026', priority: 'Normal' });
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const customerOptions = customers.map((item) => [item.id, item.name]);
  const productOptions = products.length ? products.map((item) => [item.id, item.name]) : [['', 'Add a product first']];
  return <div className="modal-backdrop"><form className="modal" onSubmit={(event) => { event.preventDefault(); if (form.productId) onCreate(form); }}><header><div><p>NEW QUOTE</p><h2>Create a new order</h2></div><button type="button" onClick={onClose}><X /></button></header><AppSelectField label="Customer" value={form.customerId} onChange={update('customerId')} options={customerOptions} /><AppSelectField label="Product" required value={form.productId} onChange={update('productId')} disabled={!products.length} options={productOptions} /><div className="form-row"><AppTextField label="Quantity" inputProps={{ min: 1 }} type="number" value={form.qty} onChange={update('qty')} /><AppSelectField label="Priority" value={form.priority} onChange={update('priority')} options={['Normal', 'High', 'Urgent']} /></div><AppTextField label="Due date" value={form.due} onChange={update('due')} /><footer><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={!products.length}>Create quote</button></footer></form></div>;
}
