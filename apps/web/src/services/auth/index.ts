import {
	type PayloadAction,
	type Reducer,
	createAsyncThunk,
	createSlice,
} from "@reduxjs/toolkit";

import api from "src/services/api";

import * as authApi from "./auth.api";

export type CurrentLocation = {
	latitude: number;
	longitude: number;
};

export type User = {
	id: string;
	avatar: string;
	email: string;
	name: string;
	isAdmin: string;
	createdAt: string;
	updatedAt: string;
};

export interface AuthState {
	currentLocation?: CurrentLocation;
	isLoadingAuth?: boolean;
	authError: string | null;
	loginEmail: string | null;
	status:
		| "unloaded"
		| "loading"
		| "authenticated"
		| "unauthenticated"
		| "error";
	user?: User;
}

const initialState: AuthState = {
	authError: null,
	currentLocation: null,
	loginEmail: null,
	status: "unloaded",
};

export const loadAuth = createAsyncThunk("auth/load", async () => {
	const response = await api.get("/me");
	return response.data as User;
});

export const logout = createAsyncThunk("auth/logout", async () => {
	await authApi.logout();
	return true;
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCurrentLocation(state, action: PayloadAction<CurrentLocation>) {
			state.currentLocation = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.authError = action.payload;
		},
		setUser(state, action: PayloadAction<User>) {
			state.user = action.payload;
		},
		setCurrentEmail(state, action: PayloadAction<string | null>) {
			state.loginEmail = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loadAuth.pending, (state) => {
				state.isLoadingAuth = true;
				state.status = "loading";
				state.authError = null;
			})
			.addCase(loadAuth.fulfilled, (state, action) => {
				state.isLoadingAuth = false;
				state.authError = null;
				state.status = action.payload.id ? "authenticated" : "unauthenticated";
				state.user = action.payload;
			})
			.addCase(loadAuth.rejected, (state, action) => {
				state.authError = action.error.message;
				state.isLoadingAuth = false;
				state.status = "unauthenticated";
				state.user = null;
			})
			.addCase(logout.pending, (state) => {
				state.authError = null;
				state.isLoadingAuth = true;
				state.status = "loading";
			})
			.addCase(logout.fulfilled, (state) => {
				state.authError = null;
				state.isLoadingAuth = false;
				state.user = null;
				state.status = "unauthenticated";
			})
			.addCase(logout.rejected, (state, action) => {
				state.authError = action.error.message;
				state.isLoadingAuth = false;
				state.status = "error";
			});
	},
});

export const { setCurrentEmail, setUser, setCurrentLocation } =
	authSlice.actions;
export default authSlice.reducer as Reducer<AuthState>;
