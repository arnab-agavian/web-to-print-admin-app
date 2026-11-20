import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createTemplateRequest,
  deleteTemplateRequest,
  getProductTemplatesRequest,
  updateTemplateRequest,
  uploadTemplateThumbnailRequest,
} from '../api/templateApi';

function apiError(error) {
  return error.response?.data?.message
    || error.response?.data?.error?.message
    || error.message
    || 'Something went wrong. Please try again.';
}

async function uploadThumbnail(file) {
  if (!file) return null;
  return uploadTemplateThumbnailRequest(file);
}

export const fetchTemplates = createAsyncThunk('templates/fetchTemplates', async (productSlug, { rejectWithValue }) => {
  try {
    return { productSlug, items: await getProductTemplatesRequest(productSlug) };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const createTemplate = createAsyncThunk('templates/createTemplate', async ({ productSlug, template, thumbnailFile }, { rejectWithValue }) => {
  try {
    const upload = await uploadThumbnail(thumbnailFile);
    const created = await createTemplateRequest(productSlug, {
      ...template,
      thumbnailPath: upload?.path ?? template.thumbnailPath,
    });
    return {
      ...created,
      thumbnail: upload?.signedUrl ?? created.thumbnail ?? created.thumbnailUrl ?? template.thumbnail,
    };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const updateTemplate = createAsyncThunk('templates/updateTemplate', async ({ templateId, template, thumbnailFile }, { rejectWithValue }) => {
  try {
    const upload = await uploadThumbnail(thumbnailFile);
    const updated = await updateTemplateRequest(templateId, {
      ...template,
      thumbnailPath: upload?.path ?? template.thumbnailPath,
    });
    return {
      ...updated,
      thumbnail: upload?.signedUrl ?? updated.thumbnail ?? updated.thumbnailUrl ?? template.thumbnail,
    };
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const deleteTemplate = createAsyncThunk('templates/deleteTemplate', async (templateId, { rejectWithValue }) => {
  try {
    await deleteTemplateRequest(templateId);
    return templateId;
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

const templateSlice = createSlice({
  name: 'templates',
  initialState: {
    productSlug: null,
    items: [],
    fetchStatus: 'idle',
    mutationStatus: 'idle',
    deletingId: null,
    fetchError: null,
    mutationError: null,
  },
  reducers: {
    clearTemplateMutation(state) {
      state.mutationError = null;
      if (state.mutationStatus !== 'loading') state.mutationStatus = 'idle';
    },
    resetTemplates(state) {
      state.productSlug = null;
      state.items = [];
      state.fetchStatus = 'idle';
      state.mutationStatus = 'idle';
      state.deletingId = null;
      state.fetchError = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state, action) => {
        state.productSlug = action.meta.arg;
        state.items = [];
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        if (state.productSlug !== action.payload.productSlug) return;
        state.items = action.payload.items;
        state.fetchStatus = 'succeeded';
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError = action.payload || 'Unable to load templates.';
      })
      .addCase(createTemplate.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.mutationStatus = 'succeeded';
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Unable to create the template.';
      })
      .addCase(updateTemplate.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Unable to update the template.';
      })
      .addCase(deleteTemplate.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.mutationError = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.deletingId = null;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.deletingId = null;
        state.mutationError = action.payload || 'Unable to delete the template.';
      });
  },
});

export const { clearTemplateMutation, resetTemplates } = templateSlice.actions;
export default templateSlice.reducer;
