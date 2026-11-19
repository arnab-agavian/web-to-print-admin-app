import React from 'react';
import { Box, Plus } from 'lucide-react';
import PageHeading from '../layout/PageHeading';
import { money } from '../../utils/formatters';

export default function ProductsPage({ products, onAdd }) {
  return <><PageHeading eyebrow="CATALOGUE" title="Manage products." description="Pricing, production type and stock readiness in one place." action={<button className="primary-button" onClick={onAdd}><Plus />Add product</button>} /><section className="table-panel product-grid">{products.map((product) => <article className="product-card" key={product.id}><div className="product-icon"><Box /></div><span>{product.id}</span><h3>{product.name}</h3><p>{product.category}</p><div><b>{money(product.price)}</b><small>base price</small></div><footer><span className={product.stock === 'Low stock' ? 'stock-low' : ''}>{product.stock}</span><b>{product.orders} orders</b></footer></article>)}</section></>;
}
