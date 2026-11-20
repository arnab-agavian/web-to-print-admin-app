import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAdminCustomersRequest } from '../api/customerApi';

function apiError(error) {
  return error.response?.data?.message
    || error.response?.data?.error?.message
    || error.message
    || 'Something went wrong. Please try again.';
}

function normalizeCustomer(customer) {
  const name = customer.fullName || customer.name || customer.companyName || customer.email || 'Unknown customer';
  return {
    ...customer,
    id: customer.id ?? customer.customerId ?? customer._id,
    name,
    contact: customer.companyName || customer.phone || 'No company or phone provided',
    company: customer.companyName || '',
    phone: customer.phone || '',
    email: customer.email || '',
    orders: Number(customer.orderCount ?? customer.orders ?? 0) || 0,
    jobsLeft: Number(customer.jobsLeft ?? customer.activeJobs ?? 0) || 0,
    spend: Number(customer.totalSpent ?? customer.spend ?? 0) || 0,
    lastOrderAt: customer.lastOrderAt || null,
  };
}

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (query = {}, { rejectWithValue }) => {
    try {
      const result = await getAdminCustomersRequest(query);
      return { ...result, customers: result.customers.map(normalizeCustomer) };
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().customers.fetchStatus !== 'loading',
  },
);

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    items: [],
    total: 0,
    fetchStatus: 'idle',
    fetchError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.items = action.payload.customers;
        state.total = action.payload.total;
        state.fetchStatus = 'succeeded';
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.fetchStatus = 'failed';
        state.fetchError = action.payload || 'Unable to load customers.';
      });
  },
});

export default customerSlice.reducer;
