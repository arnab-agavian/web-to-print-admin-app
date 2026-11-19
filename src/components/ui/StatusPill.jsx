import React from 'react';
import { statusLabel } from '../../utils/formatters';

export default function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{statusLabel(status)}</span>;
}
