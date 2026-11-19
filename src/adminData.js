export const workflow = [
  { id: 'quote', label: 'Quote', short: 'Quote' },
  { id: 'received', label: 'Order received', short: 'Order' },
  { id: 'artwork', label: 'Artwork processing', short: 'Artwork' },
  { id: 'proof_ready', label: 'Proof generated', short: 'Proof' },
  { id: 'awaiting_approval', label: 'Waiting for approval', short: 'Proof' },
  { id: 'changes_requested', label: 'Changes requested', short: 'Proof' },
  { id: 'approved', label: 'Proof approved', short: 'Approved' },
  { id: 'files_ready', label: 'Production files ready', short: 'Production' },
  { id: 'production_queue', label: 'Production queue', short: 'Production' },
  { id: 'manufacturing', label: 'Manufacturing / printing', short: 'Production' },
  { id: 'completed', label: 'Order completed', short: 'Completed' },
  { id: 'archived', label: 'Archived', short: 'Archived' },
];

export const initialOrders = [
  { id: 'DH-2056', customer: 'Northline Events', customerId: 'CUS-1001', product: 'Race number set', productId: 'PRD-101', qty: 300, total: 78240, due: '23 Nov 2026', priority: 'High', status: 'quote', proofVersion: 0, variableData: true, format: 'PDF + CSV merge', notes: 'Consecutive bib numbers from 001 to 300.' },
  { id: 'DH-2055', customer: 'Juniper Goods', customerId: 'CUS-1002', product: 'Product label roll', productId: 'PRD-102', qty: 500, total: 42810, due: '24 Nov 2026', priority: 'Normal', status: 'received', proofVersion: 0, variableData: false, format: 'High resolution PDF', notes: 'Matte finish, supplied brand colours.' },
  { id: 'DH-2054', customer: 'Maya Brooks', customerId: 'CUS-1003', product: 'MTB number boards', productId: 'PRD-103', qty: 40, total: 48640, due: '22 Nov 2026', priority: 'Urgent', status: 'changes_requested', proofVersion: 1, variableData: true, format: 'PDF + CSV merge', notes: 'Customer requested a larger rider-name field.' },
  { id: 'DH-2053', customer: 'Fieldwork Studio', customerId: 'CUS-1004', product: 'Laser-cut signs', productId: 'PRD-104', qty: 12, total: 61416, due: '21 Nov 2026', priority: 'High', status: 'approved', proofVersion: 2, variableData: false, format: 'High resolution PDF / PNG', notes: 'Approved proof uses 3 mm bleed.' },
  { id: 'DH-2052', customer: 'Kindred Coffee', customerId: 'CUS-1005', product: 'Window vinyl pack', productId: 'PRD-105', qty: 8, total: 26432, due: '21 Nov 2026', priority: 'Normal', status: 'production_queue', proofVersion: 1, variableData: false, format: 'High resolution PDF', notes: 'Files imposed and ready for print.' },
  { id: 'DH-2051', customer: 'Summit Trail Co.', customerId: 'CUS-1006', product: 'Event boards', productId: 'PRD-103', qty: 60, total: 70800, due: '20 Nov 2026', priority: 'Urgent', status: 'manufacturing', proofVersion: 3, variableData: true, format: 'PDF + CSV merge', notes: 'Printing in progress on line two.' },
  { id: 'DH-2050', customer: 'Axis Athletics', customerId: 'CUS-1007', product: 'Winner trophies', productId: 'PRD-106', qty: 18, total: 89280, due: '19 Nov 2026', priority: 'Normal', status: 'completed', proofVersion: 1, variableData: true, format: 'PNG + CSV merge', notes: 'Packed and ready for dispatch.' },
  { id: 'DH-2049', customer: 'Atlas Run Club', customerId: 'CUS-1008', product: 'Race number set', productId: 'PRD-101', qty: 220, total: 57200, due: '18 Nov 2026', priority: 'Normal', status: 'archived', proofVersion: 2, variableData: true, format: 'PDF + CSV merge', notes: 'Completed and invoiced.' },
];

export const initialProducts = [
  { id: 'PRD-101', name: 'Race number set', category: 'Event print', price: 260, stock: 'In stock', orders: 18 },
  { id: 'PRD-102', name: 'Product label roll', category: 'Labels', price: 86, stock: 'In stock', orders: 31 },
  { id: 'PRD-103', name: 'MTB number boards', category: 'Rigid media', price: 1216, stock: 'Low stock', orders: 12 },
  { id: 'PRD-104', name: 'Laser-cut signs', category: 'Fabrication', price: 5118, stock: 'Made to order', orders: 8 },
  { id: 'PRD-105', name: 'Window vinyl pack', category: 'Vinyl', price: 3304, stock: 'In stock', orders: 15 },
  { id: 'PRD-106', name: 'Winner trophies', category: 'Awards', price: 4960, stock: 'Made to order', orders: 9 },
];

export const initialCustomers = [
  { id: 'CUS-1001', name: 'Northline Events', contact: 'Olivia Chen', email: 'olivia@northline.example', orders: 14, spend: 486200 },
  { id: 'CUS-1002', name: 'Juniper Goods', contact: 'Tariq Bell', email: 'tariq@juniper.example', orders: 9, spend: 218600 },
  { id: 'CUS-1003', name: 'Maya Brooks', contact: 'Maya Brooks', email: 'maya@example.com', orders: 5, spend: 124900 },
  { id: 'CUS-1004', name: 'Fieldwork Studio', contact: 'Nora James', email: 'nora@fieldwork.example', orders: 11, spend: 396400 },
  { id: 'CUS-1005', name: 'Kindred Coffee', contact: 'Sam Reed', email: 'sam@kindred.example', orders: 7, spend: 184200 },
  { id: 'CUS-1006', name: 'Summit Trail Co.', contact: 'Isha Rao', email: 'isha@summit.example', orders: 16, spend: 712800 },
  { id: 'CUS-1007', name: 'Axis Athletics', contact: 'Elliot King', email: 'elliot@axis.example', orders: 12, spend: 549300 },
  { id: 'CUS-1008', name: 'Atlas Run Club', contact: 'June Park', email: 'june@atlas.example', orders: 8, spend: 268400 },
];

export const revenueData = [
  { day: 'Mon', revenue: 48000, orders: 7 }, { day: 'Tue', revenue: 71000, orders: 10 },
  { day: 'Wed', revenue: 59000, orders: 8 }, { day: 'Thu', revenue: 88000, orders: 12 },
  { day: 'Fri', revenue: 76000, orders: 9 }, { day: 'Sat', revenue: 42000, orders: 5 },
  { day: 'Sun', revenue: 68000, orders: 8 },
];
