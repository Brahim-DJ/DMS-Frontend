import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DepartmentState} from '../../types';
import api from '../../services/api';

const initialState: DepartmentState = {
  departments: [],
  isLoading: false,
  error: null,
};

export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch departments');
      }
      return rejectWithValue('Failed to fetch departments');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/create',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/departments', { name });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to create department');
      }
      return rejectWithValue('Failed to create department');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, name }: { id: number; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/departments/${id}`, { name });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to update department');
      }
      return rejectWithValue('Failed to update department');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to delete department');
      }
      return rejectWithValue('Failed to delete department');
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex((dept) => dept.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((dept) => dept.id !== action.payload);
      });
  },
});

export default departmentSlice.reducer;