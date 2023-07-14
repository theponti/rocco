import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import * as authApi from "./auth.api";
import { User } from "./auth.types";

export interface AuthState {
  loginEmail: string | null;
  user?: User;
}

const initialState: AuthState = {
  loginEmail: null,
};

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
  setUser(null);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setCurrentEmail(state, action: PayloadAction<string | null>) {
      state.loginEmail = action.payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers() {},
});

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.auth.value)`
export const authSelectors = {
  getUser: (state: RootState) => state.auth.user,
  getLoginEmail: (state: RootState) => state.auth.loginEmail,
};

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd = (amount: number): AppThunk => (
// 	dispatch,
// 	getState,
// ) => {
// 	const user = getUser(getState());
// 	if (!user) {
// 		dispatch(incrementByAmount(amount));
// 	}
// };

export const { setCurrentEmail, setUser } = authSlice.actions;
export default authSlice.reducer;
