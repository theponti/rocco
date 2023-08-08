import { Slot } from "expo-router";

import { AuthProvider } from "../context/auth";

export default function RootLayout() {
  return (
    // Setup the auth context and render our layout inside of it.
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
