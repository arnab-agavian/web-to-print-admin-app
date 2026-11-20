import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  approveProofRequest,
  createOrderProofRequest,
  getAdminAnalyticsRequest,
  getOrdersRequest,
  getProductionFileRequest,
  requestProofChangesRequest,
  updateJobStatusRequest,
  uploadProofPreviewRequest,
} from '../api/orderApi';

function apiError(error) {
  return error.response?.data?.message
    || error.response?.data?.error?.message
    || error.message
    || 'Something went wrong. Please try again.';
}

function displayDate(value) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function normalizeStatus(value) {
  const status = String(value || 'quote').trim().toLowerCase().replace(/[\s-]+/g, '_');
  const aliases = {
    order: 'received',
    pending: 'received',
    processing: 'artwork',
    proof: 'proof_ready',
    proofing: 'proof_ready',
    production: 'production_queue',
    in_production: 'manufacturing',
    ready_for_production: 'files_ready',
    done: 'completed',
    cancelled: 'archived',
  };
  return aliases[status] ?? status;
}

function normalizePriority(value) {
  const priority = String(value || 'Normal').trim().toLowerCase();
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function changeRequestText(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  return String(value.message ?? value.details ?? value.reason ?? value.comment ?? value.text ?? '').trim();
}

function normalizeProof(proof) {
  if (!proof || typeof proof !== 'object') return null;
  return {
    ...proof,
    changeRequestMessage: proof.changeRequestMessage || changeRequestText(proof.changeRequest),
  };
}

function normalizeOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const proofs = Array.isArray(order.proofs) ? order.proofs.map(normalizeProof).filter(Boolean) : [];
  const suppliedCurrentProof = normalizeProof(order.currentProof);
  const currentProof = suppliedCurrentProof
    ? proofs.find((proof) => proof.id === suppliedCurrentProof.id) ?? suppliedCurrentProof
    : proofs[proofs.length - 1] ?? null;
  const itemQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const rawQuantity = Number(order.quantity ?? order.qty ?? itemQuantity);
  const quantity = Number.isFinite(rawQuantity) ? rawQuantity : 0;
  const unitPrice = Number(order.unitPrice ?? order.product?.basePrice ?? 0);
  const rawTotal = Number(order.totalAmount ?? order.orderTotal ?? order.total ?? order.totalPrice ?? quantity * unitPrice);
  const deliveryAddress = order.configuration?.deliveryAddress ?? {};
  const productNames = [...new Set(items.map((item) => item.product?.name).filter(Boolean))];
  const materials = [...new Set(items.map((item) => item.material).filter(Boolean))];
  const sizes = [...new Set(items.map((item) => {
    const width = Number(item.widthMm);
    const height = Number(item.heightMm);
    return width && height ? `${width} × ${height} mm` : null;
  }).filter(Boolean))];
  const productName = productNames.length > 1
    ? `${productNames[0]} +${productNames.length - 1} more`
    : productNames[0];
  const outputDetails = [...materials, ...sizes].join(' · ');
  let status = normalizeStatus(order.status);
  const proofStatus = String(order.proofStatus ?? currentProof?.status ?? '').toLowerCase().replace(/[\s-]+/g, '_');
  if (status === 'proof_ready') {
    if (['pending', 'awaiting_approval', 'sent'].includes(proofStatus)) status = 'awaiting_approval';
    if (['change_requested', 'changes_requested'].includes(proofStatus)) status = 'changes_requested';
    if (proofStatus === 'approved') status = 'approved';
  }
  return {
    ...order,
    id: order.orderNumber ?? order.jobId ?? order.orderId ?? order.id ?? order._id,
    apiId: order.id ?? order._id,
    customer: order.customer?.fullName ?? order.customer?.name ?? order.customerName ?? (typeof order.customer === 'string' ? order.customer : null) ?? deliveryAddress.recipientName ?? 'Unknown customer',
    customerId: order.customerId ?? order.customer?.id ?? null,
    product: order.product?.name ?? order.productName ?? (typeof order.product === 'string' ? order.product : null) ?? productName ?? 'Unknown product',
    productId: order.productId ?? order.product?.id ?? items[0]?.productId ?? null,
    qty: quantity,
    total: Number.isFinite(rawTotal) ? rawTotal : 0,
    currency: order.currency ?? 'INR',
    due: displayDate(order.dueAt ?? order.dueDate ?? order.due),
    priority: normalizePriority(order.priority),
    status,
    proofStatus: proofStatus || 'not_started',
    proofVersion: Number(order.proofVersion ?? currentProof?.version ?? proofs.length ?? 0),
    proofs,
    currentProof,
    changeRequestMessage: order.changeRequestMessage
      || changeRequestText(order.changeRequest)
      || currentProof?.changeRequestMessage
      || '',
    variableData: Boolean(order.variableData ?? order.requiresVariableData ?? false),
    format: order.outputFormat ?? order.format ?? (outputDetails || 'Production artwork'),
    notes: order.notes ?? order.productionNotes ?? `${String(order.configuration?.delivery || 'standard').replace(/_/g, ' ')} delivery · ${String(order.configuration?.paymentStatus || 'payment pending').replace(/_/g, ' ')}`,
    itemCount: items.length,
    items,
  };
}

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (query = {}, { rejectWithValue }) => {
    try {
      const result = await getOrdersRequest(query);
      return { ...result, jobs: result.jobs.map(normalizeOrder) };
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().orders.fetchStatus !== 'loading',
  },
);

export const createOrderProof = createAsyncThunk('orders/createProof', async ({ orderId, orderKey, file, notes }, { rejectWithValue }) => {
  try {
    const upload = await uploadProofPreviewRequest(file);
    const previewUrl = upload?.publicUrl;
    if (!previewUrl) throw new Error('The upload API did not return a public URL.');
    const result = await createOrderProofRequest(orderId, { previewPath: previewUrl, notes: notes.trim() });
    const proof = result?.proof ?? result;
    return { orderKey, proof: { ...proof, previewPath: proof?.previewPath ?? previewUrl } };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const approveOrderProof = createAsyncThunk('orders/approveProof', async ({ orderKey, proofId }, { rejectWithValue }) => {
  try {
    return { orderKey, proofId, result: await approveProofRequest(proofId) };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const requestOrderProofChanges = createAsyncThunk('orders/requestProofChanges', async ({ orderKey, proofId, message }, { rejectWithValue }) => {
  try {
    return { orderKey, proofId, message, result: await requestProofChangesRequest(proofId, message.trim()) };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const updateJobStatus = createAsyncThunk('orders/updateJobStatus', async ({ orderId, orderKey, status, localStatus }, { getState, rejectWithValue }) => {
  try {
    const current = getState().orders.items.find((item) => item.id === orderKey);
    if (status === 'production' && current?.proofStatus !== 'approved' && !current?.productionReady) {
      return rejectWithValue('An approved proof is required before moving this job to production.');
    }
    const result = await updateJobStatusRequest(orderId, status);
    const updated = result?.job ?? result?.order ?? result;
    return {
      orderKey,
      order: updated && typeof updated === 'object'
        ? normalizeOrder({ ...current, ...updated })
        : { ...current, status: localStatus },
      localStatus,
    };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const downloadProductionFile = createAsyncThunk('orders/downloadProductionFile', async ({ orderId, orderKey, orderNumber }, { rejectWithValue }) => {
  try {
    const { blob, filename } = await getProductionFileRequest(orderId, `${orderNumber || orderKey}-production.pdf`);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return { orderKey, filename };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const fetchAdminAnalytics = createAsyncThunk('orders/fetchAdminAnalytics', async (_, { rejectWithValue }) => {
  try {
    return await getAdminAnalyticsRequest();
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    total: 0,
    fetchStatus: 'idle',
    fetchError: null,
    proofMutationStatus: 'idle',
    proofMutationError: null,
    proofMutationOrderId: null,
    statusMutationStatus: 'idle',
    statusMutationError: null,
    statusMutationOrderId: null,
    downloadStatus: 'idle',
    downloadError: null,
    downloadOrderId: null,
    analytics: null,
    analyticsStatus: 'idle',
    analyticsError: null,
  },
  reducers: {
    prependOrderLocally(state, action) {
      state.items.unshift(action.payload);
    },
    updateOrderLocally(state, action) {
      const { id, changes } = action.payload;
      const order = state.items.find((item) => item.id === id);
      if (order) Object.assign(order, changes);
    },
    clearProofMutation(state) {
      state.proofMutationError = null;
      if (state.proofMutationStatus !== 'loading') state.proofMutationStatus = 'idle';
    },
    clearJobFeedback(state) {
      state.statusMutationError = null;
      state.downloadError = null;
      if (state.statusMutationStatus !== 'loading') state.statusMutationStatus = 'idle';
      if (state.downloadStatus !== 'loading') state.downloadStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload.jobs;
        state.total = action.payload.total;
        state.fetchStatus = 'succeeded';
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.fetchStatus = 'failed';
        state.fetchError = action.payload || 'Unable to load orders.';
      })
      .addCase(createOrderProof.fulfilled, (state, action) => {
        const order = state.items.find((item) => item.id === action.payload.orderKey);
        if (order) {
          order.proofs = [...(order.proofs || []).filter((proof) => proof.id !== action.payload.proof.id), action.payload.proof];
          order.currentProof = action.payload.proof;
          order.proofVersion = Number(action.payload.proof.version ?? order.proofs.length);
          order.proofStatus = String(action.payload.proof.status ?? 'pending');
          order.status = 'awaiting_approval';
        }
        state.proofMutationStatus = 'succeeded';
        state.proofMutationOrderId = null;
      })
      .addCase(approveOrderProof.fulfilled, (state, action) => {
        const order = state.items.find((item) => item.id === action.payload.orderKey);
        if (order) {
          const proof = order.proofs?.find((item) => item.id === action.payload.proofId) ?? order.currentProof;
          if (proof) Object.assign(proof, action.payload.result?.proof ?? action.payload.result, { status: 'approved' });
          order.currentProof = proof ?? order.currentProof;
          order.proofStatus = 'approved';
          order.status = 'approved';
          order.productionReady = true;
        }
        state.proofMutationStatus = 'succeeded';
        state.proofMutationOrderId = null;
      })
      .addCase(requestOrderProofChanges.fulfilled, (state, action) => {
        const order = state.items.find((item) => item.id === action.payload.orderKey);
        if (order) {
          const proof = order.proofs?.find((item) => item.id === action.payload.proofId) ?? order.currentProof;
          if (proof) Object.assign(proof, action.payload.result?.proof ?? action.payload.result, { status: 'change_requested', changeRequestMessage: action.payload.message });
          order.currentProof = proof ?? order.currentProof;
          order.proofStatus = 'change_requested';
          order.status = 'changes_requested';
          order.changeRequestMessage = action.payload.message;
        }
        state.proofMutationStatus = 'succeeded';
        state.proofMutationOrderId = null;
      })
      .addCase(updateJobStatus.pending, (state, action) => {
        state.statusMutationStatus = 'loading';
        state.statusMutationError = null;
        state.statusMutationOrderId = action.meta.arg.orderKey;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.orderKey);
        if (index !== -1) state.items[index] = { ...state.items[index], ...action.payload.order, status: action.payload.localStatus ?? action.payload.order.status };
        state.statusMutationStatus = 'succeeded';
        state.statusMutationOrderId = null;
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.statusMutationStatus = 'failed';
        state.statusMutationError = action.payload || 'Unable to update the production status.';
        state.statusMutationOrderId = null;
      })
      .addCase(downloadProductionFile.pending, (state, action) => {
        state.downloadStatus = 'loading';
        state.downloadError = null;
        state.downloadOrderId = action.meta.arg.orderKey;
      })
      .addCase(downloadProductionFile.fulfilled, (state, action) => {
        const order = state.items.find((item) => item.id === action.payload.orderKey);
        if (order) order.downloaded = true;
        state.downloadStatus = 'succeeded';
        state.downloadOrderId = null;
      })
      .addCase(downloadProductionFile.rejected, (state, action) => {
        state.downloadStatus = 'failed';
        state.downloadError = action.payload || 'Unable to download the production PDF.';
        state.downloadOrderId = null;
      })
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.analyticsStatus = 'loading';
        state.analyticsError = null;
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
        state.analyticsStatus = 'succeeded';
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.analyticsStatus = 'failed';
        state.analyticsError = action.payload || 'Unable to load analytics.';
      })
      .addMatcher(
        (action) => [createOrderProof.pending.type, approveOrderProof.pending.type, requestOrderProofChanges.pending.type].includes(action.type),
        (state, action) => {
          state.proofMutationStatus = 'loading';
          state.proofMutationError = null;
          state.proofMutationOrderId = action.meta.arg.orderKey;
        },
      )
      .addMatcher(
        (action) => [createOrderProof.rejected.type, approveOrderProof.rejected.type, requestOrderProofChanges.rejected.type].includes(action.type),
        (state, action) => {
          state.proofMutationStatus = 'failed';
          state.proofMutationError = action.payload || 'Unable to update the proof.';
          state.proofMutationOrderId = null;
        },
      );
  },
});

export const { clearJobFeedback, clearProofMutation, prependOrderLocally, updateOrderLocally } = orderSlice.actions;
export default orderSlice.reducer;
