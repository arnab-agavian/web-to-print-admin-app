import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function NewOrderModal({ customers, products, onClose, onCreate }) {
  const [form, setForm] = useState({ customerId: customers[0].id, productId: products[0].id, qty: 100, due: '27 Nov 2026', priority: 'Normal' });
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <div className="modal-backdrop"><form className="modal" onSubmit={(event) => { event.preventDefault(); onCreate(form); }}><header><div><p>NEW QUOTE</p><h2>Create a new order</h2></div><button type="button" onClick={onClose}><X /></button></header><label>Customer<select value={form.customerId} onChange={update('customerId')}>{customers.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Product<select value={form.productId} onChange={update('productId')}>{products.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><div className="form-row"><label>Quantity<input min="1" type="number" value={form.qty} onChange={update('qty')} /></label><label>Priority<select value={form.priority} onChange={update('priority')}><option>Normal</option><option>High</option><option>Urgent</option></select></label></div><label>Due date<input value={form.due} onChange={update('due')} /></label><footer><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Create quote</button></footer></form></div>;
}
