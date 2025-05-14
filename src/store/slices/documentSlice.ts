import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DocumentState, DocumentRequest } from '../../types';
import api from '../../services/api';

const initialState: DocumentState = {
  documents: [],
  selectedDocument: null,
  isLoading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch document');
    }
  }
);

export const createDocument = createAsyncThunk(
  'documents/create',
  async (document: DocumentRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/documents', document);
      return response.data;
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create document');
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/update',
  async ({ id, document }: { id: number; document: DocumentRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/documents/${id}`, document);
      return response.data;
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${id}`);
      return id;
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete document');
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'documents/search',
  async (keyword: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/search?keyword=${keyword}`);
      return response.data;
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Search failed');
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearSelectedDocument: (state) => {
      state.selectedDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload);
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.selectedDocument?.id === action.payload.id) {
          state.selectedDocument = action.payload;
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((doc) => doc.id !== action.payload);
        if (state.selectedDocument?.id === action.payload) {
          state.selectedDocument = null;
        }
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
      });
  },
});

export const { clearSelectedDocument } = documentSlice.actions;

export default documentSlice.reducer;