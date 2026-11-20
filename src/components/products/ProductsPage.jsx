import React from 'react';
import { AlertCircle, Box, LayoutTemplate, LoaderCircle, PackageOpen, Pencil, Plus, RefreshCw } from 'lucide-react';
import PageHeading from '../layout/PageHeading';
import { money } from '../../utils/formatters';

export default function ProductsPage({ products, status, error, onRetry, onAdd, onEdit, onTemplates }) {
  const loading = status === 'loading';
  let content;
  if (loading && !products.length) {
    content = <section className="table-panel product-state" role="status"><LoaderCircle className="spin" /><b>Loading products</b><span>Fetching the latest catalogue…</span></section>;
  } else if (error && !products.length) {
    content = <section className="table-panel product-state product-state-error" role="alert"><AlertCircle /><b>Could not load products</b><span>{error}</span><button className="secondary-button" onClick={onRetry}><RefreshCw />Try again</button></section>;
  } else if (!products.length) {
    content = <section className="table-panel product-state"><PackageOpen /><b>No products yet</b><span>Add the first product to your catalogue.</span></section>;
  } else {
    content = <section className="table-panel product-grid">{products.map((product) => <article className="product-card" key={product.id}><div className="product-card-actions"><button onClick={() => onTemplates(product)} aria-label={`Manage templates for ${product.name}`} title="Manage templates"><LayoutTemplate /></button><button onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`} title="Edit product"><Pencil /></button></div><div className="product-icon"><Box /></div><span>{product.slug || product.id}</span><h3>{product.name}</h3><p>{String(product.category).replace(/_/g, ' ')}</p><div><b>{money(product.price)}</b><small>base price</small></div><footer><span className={product.stock === 'Inactive' ? 'stock-low' : ''}>{product.stock}</span><b>Min. {product.minQuantity || 1}</b></footer></article>)}</section>;
  }
  return <><PageHeading eyebrow="CATALOGUE" title="Manage products." description="Pricing, production type and stock readiness in one place." action={<button className="primary-button" onClick={onAdd} disabled={loading}><Plus />Add product</button>} />{content}</>;
}
