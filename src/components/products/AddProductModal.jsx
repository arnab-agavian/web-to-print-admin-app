import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AppSelectField, AppTextField } from '../ui/AppFields';

const initialForm = {
  name: '',
  slug: '',
  family: 'labels',
  description: '',
  materials: '',
  configurationSchema: {},
  basePrice: '',
  minQuantity: 1,
  minWidth: 10,
  maxWidth: 1000,
  minHeight: 10,
  maxHeight: 1000,
  defaultWidth: 100,
  defaultHeight: 100,
};

const families = [
  ['labels', 'Labels'],
  ['race_numbers', 'Race numbers'],
  ['mtb_boards', 'MTB boards'],
  ['stamps', 'Stamps'],
  ['trophies', 'Trophies'],
  ['laser_cut', 'Laser cut'],
];

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formForProduct(product) {
  if (!product) return initialForm;
  return {
    ...initialForm,
    name: product.name ?? '',
    slug: product.slug ?? '',
    family: product.family ?? 'labels',
    description: product.description ?? '',
    materials: Array.isArray(product.configurationSchema?.materials)
      ? product.configurationSchema.materials.join(', ')
      : '',
    configurationSchema: product.configurationSchema ?? {},
    basePrice: product.basePrice ?? product.price ?? '',
    minQuantity: product.minQuantity ?? 1,
    minWidth: product.minWidth ?? 10,
    maxWidth: product.maxWidth ?? 1000,
    minHeight: product.minHeight ?? 10,
    maxHeight: product.maxHeight ?? 1000,
    defaultWidth: product.defaultWidth ?? 100,
    defaultHeight: product.defaultHeight ?? 100,
    active: product.active !== false,
  };
}

export default function AddProductModal({ product, onClose, onCreate, status, error, clearError }) {
  const [form, setForm] = useState(() => formForProduct(product));
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const editing = Boolean(product);
  const loading = status === 'loading';
  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !slugEdited ? { slug: slugify(value) } : {}),
    }));
    if (error) clearError();
  };
  const updateSlug = (event) => {
    setSlugEdited(true);
    setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
    if (error) clearError();
  };
  const submit = (event) => {
    event.preventDefault();
    onCreate(form);
  };

  const numberInput = (min, max, step = 0.01) => ({ htmlInput: { min, ...(max != null ? { max } : {}), step } });

  return (
    <div className="modal-backdrop">
      <form className="modal product-modal" onSubmit={submit}>
        <header><div><p>CATALOGUE</p><h2>{editing ? 'Edit product' : 'Add product'}</h2></div><button type="button" onClick={onClose} disabled={loading} aria-label="Close"><X /></button></header>
        <div className="form-row">
          <AppTextField label="Product name" required slotProps={{ htmlInput: { minLength: 2, maxLength: 200 } }} value={form.name} onChange={update('name')} placeholder="e.g. Event banner" disabled={loading} />
          <AppTextField label="Slug" required slotProps={{ htmlInput: { minLength: 2, maxLength: 100, pattern: '[a-z0-9]+(?:-[a-z0-9]+)*' } }} value={form.slug} onChange={updateSlug} placeholder="event-banner" disabled={loading} />
        </div>
        <AppSelectField label="Product family" value={form.family} onChange={update('family')} disabled={loading} options={families} />
        <AppTextField label="Description" multiline minRows={3} slotProps={{ htmlInput: { maxLength: 2000 } }} value={form.description} onChange={update('description')} placeholder="Describe the product and its intended use" disabled={loading} />
        <AppTextField label="Materials" required value={form.materials} onChange={update('materials')} placeholder="vinyl, mesh" disabled={loading} helperText="Separate multiple materials with commas." />
        <div className="form-row">
          <AppTextField label="Base price (₹)" required type="number" slotProps={numberInput(0.01)} value={form.basePrice} onChange={update('basePrice')} disabled={loading} />
          <AppTextField label="Minimum quantity" required type="number" slotProps={numberInput(1, null, 1)} value={form.minQuantity} onChange={update('minQuantity')} disabled={loading} />
        </div>
        <p className="modal-section-label">SIZE LIMITS (MM)</p>
        <div className="form-row">
          <AppTextField label="Minimum width" required type="number" slotProps={numberInput(0.01)} value={form.minWidth} onChange={update('minWidth')} disabled={loading} />
          <AppTextField label="Maximum width" required type="number" slotProps={numberInput(form.minWidth || 0.01)} value={form.maxWidth} onChange={update('maxWidth')} disabled={loading} />
        </div>
        <div className="form-row">
          <AppTextField label="Minimum height" required type="number" slotProps={numberInput(0.01)} value={form.minHeight} onChange={update('minHeight')} disabled={loading} />
          <AppTextField label="Maximum height" required type="number" slotProps={numberInput(form.minHeight || 0.01)} value={form.maxHeight} onChange={update('maxHeight')} disabled={loading} />
        </div>
        <div className="form-row">
          <AppTextField label="Default width" required type="number" slotProps={numberInput(form.minWidth || 0.01, form.maxWidth)} value={form.defaultWidth} onChange={update('defaultWidth')} disabled={loading} />
          <AppTextField label="Default height" required type="number" slotProps={numberInput(form.minHeight || 0.01, form.maxHeight)} value={form.defaultHeight} onChange={update('defaultHeight')} disabled={loading} />
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <footer><button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancel</button><button className="primary-button" type="submit" disabled={loading} aria-busy={loading}>{loading ? (editing ? 'Saving changes…' : 'Adding product…') : (editing ? 'Save changes' : 'Add product')}</button></footer>
      </form>
    </div>
  );
}
