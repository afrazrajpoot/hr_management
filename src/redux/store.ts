import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { employeeApi } from './employe-api';
import counterReducer from './features/counterSlice';
import { hrApi } from './hr-api';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [hrApi.reducerPath]: hrApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(employeeApi.middleware)
      .concat(hrApi.middleware), // ✅ add this line
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
