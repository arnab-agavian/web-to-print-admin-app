import React from 'react';
import { Check } from 'lucide-react';
import { statusIndex } from '../../utils/formatters';

const phases = [['quote', 'Quote'], ['received', 'Order received'], ['artwork', 'Artwork'], ['proof_ready', 'Proof & approval'], ['approved', 'Files'], ['production_queue', 'Production'], ['completed', 'Completed'], ['archived', 'Archived']];

export default function WorkflowTimeline({ order }) {
  const current = statusIndex(order.status);
  return <div className="workflow-timeline">{phases.map(([id, label]) => { const done = current >= statusIndex(id) || (id === 'proof_ready' && ['awaiting_approval', 'changes_requested'].includes(order.status)); return <div className={done ? 'done' : ''} key={id}><span>{done ? <Check /> : null}</span><b>{label}</b></div>; })}</div>;
}
