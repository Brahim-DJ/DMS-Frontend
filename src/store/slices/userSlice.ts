import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserState} from '../../types';
import api from '../../services/api';

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
      }
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async (
    { id, userData }: { id: number; userData: { email?: string; role?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to update user');
      }
      return rejectWithValue('Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
      }
      return rejectWithValue('Failed to delete user');
    }
  }
);

export const assignDepartmentsToUser = createAsyncThunk(
  'users/assignDepartments',
  async ({ userId, departmentIds }: { userId: number; departmentIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/departments`, { departmentIds });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to assign departments');
      }
      return rejectWithValue('Failed to assign departments');
    }
  }
);

export const removeDepartmentsFromUser = createAsyncThunk(
  'users/removeDepartments',
  async ({ userId, departmentIds }: { userId: number; departmentIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${userId}/departments`, { 
        data: { departmentIds } 
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to remove departments');
      }
      return rejectWithValue('Failed to remove departments');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(assignDepartmentsToUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(removeDepartmentsFromUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      });
  },
});

export const { clearSelectedUser } = userSlice.actions;

export default userSlice.reducer;