import React from 'react';
import { ChevronRight, FileBox } from 'lucide-react';
import StatusPill from '../ui/StatusPill';
import { boardStage, money, statusLabel } from '../../utils/formatters';

const stages = ['Quote', 'Orders', 'Artwork', 'Proofs', 'Production', 'Completed'];

export default function Pipeline({ orders, onOpen, onViewAll }) {
  return (
    <section className="pipeline"><div className="section-title"><div><h2>Production pipeline</h2><p>Every live job, from quote to completion.</p></div><button onClick={onViewAll}>View job database</button></div><div className="pipeline-grid">
      {stages.map((stage, index) => { const stageOrders = orders.filter((item) => boardStage(item.status) === stage); return <div className="pipe-column" key={stage}><div className="pipe-head"><span><i className={`dot dot-${index}`} />{stage}</span><b>{stageOrders.length}</b></div><div className="pipe-body">{stageOrders.slice(0, 3).map((order) => <button className="job-card" key={order.id} onClick={() => onOpen(order.id)}><div className="job-top"><span>{order.id}</span><StatusPill status={order.status} /></div><h3>{order.product}</h3><p>{order.customer}</p><div className="job-spec"><span>{order.qty} units</span><span>Due {order.due.replace(' 2026', '')}</span></div>{order.proofVersion > 0 && ['proof_ready', 'awaiting_approval', 'changes_requested', 'approved'].includes(order.status) && <div className="proof-note"><span>V{order.proofVersion}</span>{statusLabel(order.status)}</div>}<div className="job-foot"><b>{money(order.total)}</b><ChevronRight /></div></button>)}{!stageOrders.length && <div className="empty-col"><FileBox /><span>No jobs here</span></div>}</div></div>; })}
    </div></section>
  );
}
