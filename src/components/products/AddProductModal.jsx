import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddProductModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', category: '', price: '' });
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <div className="modal-backdrop"><form className="modal" onSubmit={(event) => { event.preventDefault(); if (form.name && form.category && form.price) onCreate(form); }}><header><div><p>CATALOGUE</p><h2>Add product</h2></div><button type="button" onClick={onClose}><X /></button></header><label>Product name<input value={form.name} onChange={update('name')} placeholder="e.g. Event banner" /></label><label>Category<input value={form.category} onChange={update('category')} placeholder="e.g. Large format" /></label><label>Base price (₹)<input type="number" min="1" value={form.price} onChange={update('price')} /></label><footer><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Add product</button></footer></form></div>;
}
