import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createProductRequest, getProductsRequest, updateProductRequest } from '../api/productApi';

function apiError(error) {
  return error.response?.data?.message
    || error.response?.data?.error?.message
    || error.message
    || 'Something went wrong. Please try again.';
}

function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product.basePrice ?? product.price ?? 0),
    category: product.family ?? product.category ?? 'Uncategorised',
    stock: product.active === false ? 'Inactive' : 'Active',
    orders: Number(product.orders ?? 0),
  };
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return (await getProductsRequest()).map(normalizeProduct);
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().products.fetchStatus !== 'loading',
  },
);

export const createProduct = createAsyncThunk('products/createProduct', async (product, { rejectWithValue }) => {
  try {
    return normalizeProduct(await createProductRequest(product));
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ originalSlug, product }, { rejectWithValue }) => {
  try {
    return normalizeProduct(await updateProductRequest(originalSlug, product));
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    fetchStatus: 'idle',
    createStatus: 'idle',
    updateStatus: 'idle',
    fetchError: null,
    createError: null,
    updateError: null,
  },
  reducers: {
    clearCreateProductError(state) {
      state.createError = null;
      if (state.createStatus === 'failed') state.createStatus = 'idle';
    },
    clearUpdateProductError(state) {
      state.updateError = null;
      if (state.updateStatus === 'failed') state.updateStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.fetchStatus = 'succeeded';
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.fetchStatus = 'failed';
        state.fetchError = action.payload || 'Unable to load products.';
      })
      .addCase(createProduct.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.createStatus = 'succeeded';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload || 'Unable to create the product.';
      })
      .addCase(updateProduct.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const { originalSlug } = action.meta.arg;
        const index = state.items.findIndex((item) => item.id === action.payload.id || item.slug === originalSlug);
        if (index >= 0) state.items[index] = action.payload;
        state.updateStatus = 'succeeded';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload || 'Unable to update the product.';
      });
  },
});

export const { clearCreateProductError, clearUpdateProductError } = productSlice.actions;
export default productSlice.reducer;
