import {
	type Action,
	type ThunkAction,
	configureStore,
} from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { toastSlice } from "./toast";

export const rootReducer = {
	toast: toastSlice.reducer,
};

export const store = configureStore({
	reducer: rootReducer,
	// Performance optimizations
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore these action types (usually used for non-serializable data)
				ignoredActions: [],
				// Ignore these paths in the state
				ignoredPaths: [],
			},
			immutableCheck: {
				// More performant by checking only a sample of states
				warnAfter: 128,
			},
		}),
	devTools: import.meta.env.DEV,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;

// Use throughout client application instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
