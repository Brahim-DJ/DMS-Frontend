import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import departmentReducer from "./slices/departmentSlice";
import categoryReducer from "./slices/categorySlice";
import documentReducer from "./slices/documentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    departments: departmentReducer,
    categories: categoryReducer,
    documents: documentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
