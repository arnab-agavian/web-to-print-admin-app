import { workflow } from '../adminData';

export const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

export const statusLabel = (status) => workflow.find((item) => item.id === status)?.label || status;
export const statusIndex = (status) => workflow.findIndex((item) => item.id === status);

export const boardStage = (status) => {
  if (status === 'quote') return 'Quote';
  if (status === 'received') return 'Orders';
  if (status === 'artwork') return 'Artwork';
  if (['proof_ready', 'awaiting_approval', 'changes_requested'].includes(status)) return 'Proofs';
  if (['approved', 'files_ready', 'production_queue', 'manufacturing'].includes(status)) return 'Production';
  return 'Completed';
};
