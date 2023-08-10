import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation, useRouter, useSegments } from "expo-router";

type AuthState = {
  token: string | null;
  email?: string | null;
  authenticating: boolean;
};

interface AuthProps {
  authState: AuthState;
  onLogin: (email: string) => Promise<void>;
  onAuthenticate: (emailToken: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function useProtectedRoute(user: any) {
  const rootSegment = useSegments()[0];
  const router = useRouter();
  const nav = useNavigation();

  React.useEffect(() => {
    // If the user is undefined, authentication is in process.
    if (user === undefined) {
      return;
    }

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      rootSegment !== "(auth)"
    ) {
      // nav.dispatch(
      //   StackActions.replace("(auth)/signin", {
      //     // user: 'jane',
      //   })
      // );
      // Redirect to the signin page.
      router.replace("/signin");
    } else if (user && rootSegment !== "(app)") {
      // Redirect away from the signin page.
      router.replace("/");
      // router.replace("/compose");
      // nav.dispatch(
      //   StackActions.replace("(app)", {
      //     // user: 'jane',
      //   })
      // );
    }
  }, [user, rootSegment]);
}

const baseAuthState: AuthState = {
  authenticating: true,
  email: null,
  token: null,
};

const AuthContext = createContext<AuthProps>({
  authState: baseAuthState,
  onLogin: async () => {},
  onAuthenticate: async () => {},
  onLogout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = React.useState<any>(undefined);
  const [authState, setAuthState] = useState<AuthState>(baseAuthState);

  const onAuthenticate = async (emailToken: string) => {
    try {
      setAuthState({ token: null, authenticating: true });
      const response = await axios.post(`${API_URL}/authenticate`, {
        email: authState.email,
        emailToken,
      });
      const token = response.headers["Authorization"].split(" ")[1];
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await SecureStore.setItemAsync("token", token);
      console.log({ user: response.data.user, token });
      setUser(response.data.user);
      setAuthState({ token: token, authenticating: false });
    } catch (e: any) {
      setAuthState({ token: null, authenticating: false });
      throw new Error(e);
    }
  };

  const onLogin = async (email: string) => {
    try {
      setAuthState({ token: null, authenticating: true });
      // This will send an email to the user with a token.
      await axios.post(`${API_URL}/login`, { email });
      setAuthState({
        token: null,
        authenticating: false,
        email,
      });
    } catch (e: any) {
      setAuthState({ token: null, authenticating: false });
      throw new Error(e);
    }
  };

  const onLogout = async () => {
    try {
      setAuthState({ token: null, authenticating: true });
      await SecureStore.deleteItemAsync("token");
      setAuthState({ token: null, authenticating: false });
    } catch (e: any) {
      throw new Error(e);
    }
  };

  React.useEffect(() => {
    async function getToken() {
      // User will only be undefined on the first render.
      if (user === undefined) {
        const token = await SecureStore.getItemAsync("token");

        if (token) {
          setAuthState({ token, authenticating: false });
        } else {
          setUser(null);
          setAuthState({
            token: null,
            authenticating: false,
          });
        }
      }
    }

    getToken();
  });

  useProtectedRoute(user);

  return (
    <AuthContext.Provider
      value={{ authState, onAuthenticate, onLogin, onLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
