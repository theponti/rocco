import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import auth from "./auth";

export const store = configureStore({
  reducer: {
    auth: auth,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
