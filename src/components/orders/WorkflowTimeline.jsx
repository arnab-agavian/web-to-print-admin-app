import React, { useState } from 'react';
import { Check, FileBox } from 'lucide-react';
import { money, statusIndex } from '../../utils/formatters';
import ProofManager from './ProofManager';
import CustomerDesignPreviewModal, { customerDesignPreviewUrl } from './CustomerDesignPreviewModal';

const phases = [['quote', 'Quote'], ['received', 'Order received'], ['artwork', 'Artwork'], ['proof_ready', 'Proof & approval'], ['approved', 'Files'], ['production_queue', 'Production'], ['completed', 'Completed'], ['archived', 'Archived']];

export default function WorkflowTimeline({ order }) {
  const current = statusIndex(order.status);
  const [previewItem, setPreviewItem] = useState(null);
  return (
    <>
      <div className="workflow-timeline">{phases.map(([id, label]) => { const done = current >= statusIndex(id) || (id === 'proof_ready' && ['awaiting_approval', 'changes_requested'].includes(order.status)); return <div className={done ? 'done' : ''} key={id}><span>{done ? <Check /> : null}</span><b>{label}</b></div>; })}</div>
      {order.items?.length > 0 && (
        <section className="order-line-items">
          <div className="order-line-items-head"><span>CUSTOMER DESIGN PREVIEWS</span><b>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</b></div>
          {order.items.map((item) => {
            const preview = customerDesignPreviewUrl(item);
            const hasDesign = Boolean(preview || item.configuration?.designData?.layers?.length);
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unitPrice) || 0;
            const width = Number(item.widthMm);
            const height = Number(item.heightMm);
            const size = width && height ? `${width} × ${height} mm` : 'Custom size';
            return (
              <article className="order-line-item" key={item.id}>
                <div className="order-line-preview">{preview ? <button type="button" onClick={() => setPreviewItem(item)} title="Open customer design preview"><img src={preview} alt={`${item.product?.name || 'Product'} customer design preview`} /></button> : <FileBox />}</div>
                <div className="order-line-copy"><b>{item.product?.name || 'Product item'}</b><span>{item.design?.name || item.configuration?.designName || item.configuration?.artworkName || 'Custom design'}</span><small>{item.material || 'Material not set'} · {size} · Qty {quantity} · {item.configuration?.designMethod || 'customer design'}</small>{hasDesign && <button className="open-design-preview" type="button" onClick={() => setPreviewItem(item)}>Open full preview</button>}</div>
                <div className="order-line-price"><b>{money(quantity * unitPrice)}</b><small>{money(unitPrice)} each</small></div>
              </article>
            );
          })}
        </section>
      )}
      <ProofManager order={order} />
      {previewItem && <CustomerDesignPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
    </>
  );
}
