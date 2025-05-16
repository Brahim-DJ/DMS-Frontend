import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginRequest, RegisterRequest, User } from '@/types';
import api from '../../services/api';

// Helper function to save auth state to local storage
const saveAuthToLocalStorage = (token: string | null, user: User | null) => {
  try {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Auth data saved to local storage:', { token: token.substring(0, 15) + '...', user });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Auth data cleared from local storage');
    }
  } catch (error) {
    console.error('Error saving auth data to localStorage:', error);
  }
};

// Helper function to get auth state from local storage
const getAuthFromLocalStorage = (): { token: string | null; user: User | null } => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('Auth data retrieved from local storage:', { 
      token: token ? token.substring(0, 15) + '...' : null,
      user
    });
    return { token, user };
  } catch (error) {
    console.error('Error reading auth data from localStorage:', error);
    return { token: null, user: null };
  }
};

// Get initial state from localStorage
const { token, user } = getAuthFromLocalStorage();

const initialState: AuthState = {
  user,
  token,
  isAuthenticated: !!(token && user),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      // 1. Login request (no token needed)
      const response = await api.post('/auth/login', credentials);
      const { token, userId, email, role } = response.data;

      // 2. Fetch user profile with Bearer token
      const userResponse = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = userResponse.data;

      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        departments: userData.departments || [],
      };

      // 3. Save to localStorage for future requests
      saveAuthToLocalStorage(token, user);

      return { token, user };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear localStorage
  saveAuthToLocalStorage(null, null);
  return null;
});

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.token) return rejectWithValue('No token found');

      const response = await api.get(`/auth/validate?token=${auth.token}`);
      if (!response.data.valid) {
        saveAuthToLocalStorage(null, null);
        return rejectWithValue('Invalid token');
      }
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      saveAuthToLocalStorage(null, null);
      return rejectWithValue(err.response?.data?.message || 'Token validation failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(validateToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { resetError } = authSlice.actions;

export default authSlice.reducer;