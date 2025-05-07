import { createSelector } from "@reduxjs/toolkit";
import { type RootState, useAppDispatch, useAppSelector } from "app/lib/store";
import { useCallback, useMemo } from "react";
import { closeToast, openToast } from "./index";
import type { ToastMessage } from "./types";

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
