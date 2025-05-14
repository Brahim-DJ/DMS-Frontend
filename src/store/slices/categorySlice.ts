import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CategoryState} from '../../types';
import api from '../../services/api';

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'response' in error
          ? ((error as { response: { data: { message: string } } }).response.data.message)
          : 'Failed to fetch categories'
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async ({ name, description }: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', { name, description });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'response' in error
          ? ((error as { response: { data: { message: string } } }).response.data.message)
          : 'Failed to create category'
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async (
    { id, name, description }: { id: number; name: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/categories/${id}`, { name, description });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'response' in error
        ? ((error as { response: { data: { message: string } } }).response.data.message)
        : 'Failed to update category'
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'response' in error
        ? ((error as { response: { data: { message: string } } }).response.data.message)
        : 'Failed to delete category'
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((cat) => cat.id !== action.payload);
      });
  },
});

export default categorySlice.reducer;