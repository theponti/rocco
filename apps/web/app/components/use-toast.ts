import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { useCallback, useMemo } from "react";
import { type RootState, useAppDispatch, useAppSelector } from "~/lib/store";

export type ToastMessage = {
	text: string;
	type: string;
};

export const toastSlice = createSlice({
	name: "toast",
	initialState: {
		isOpen: false,
		messages: [],
	},
	reducers: {
		openToast(state, action: PayloadAction<ToastMessage>) {
			state.isOpen = true;
			(state.messages as ToastMessage[]).push(action.payload);
		},
		closeToast(state) {
			state.isOpen = false;
			state.messages = [];
		},
	},
});

export const { openToast, closeToast } = toastSlice.actions;

// Memoized selectors
const selectToastState = (state: RootState) => state.toast;
const selectIsOpen = createSelector(
	[selectToastState],
	(toast) => toast.isOpen,
);
const selectMessages = createSelector(
	[selectToastState],
	(toast) => toast.messages as ToastMessage[],
);

export const useToast = () => {
	// Use memoized selectors to prevent unnecessary re-renders
	const isOpen = useAppSelector(selectIsOpen);
	const messages = useAppSelector(selectMessages);
	const dispatch = useAppDispatch();

	// Create stable callback references that won't change on re-renders
	const openToastCallback = useCallback(
		(message: ToastMessage) => {
			dispatch(openToast(message));

			// Set a timeout to close the toast automatically
			setTimeout(() => {
				dispatch(closeToast());
			}, 3000);
		},
		[dispatch],
	);

	const closeToastCallback = useCallback(() => {
		dispatch(closeToast());
	}, [dispatch]);

	// Return memoized object to prevent unnecessary re-renders
	return useMemo(
		() => ({
			isOpen,
			messages,
			openToast: openToastCallback,
			closeToast: closeToastCallback,
		}),
		[isOpen, messages, openToastCallback, closeToastCallback],
	);
};
