import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text } from "react-native";

import { useAuth } from "../../context/auth";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function AppLayout() {
  const router = useRouter();
  const { authState } = useAuth();

  if (authState.authenticating) {
    return (
      <Text
        style={{
          fontWeight: "normal",
          paddingHorizontal: 8,
          fontSize: 16,
        }}
      >
        Loading...
      </Text>
    );
  }

  return (
    <>
      <StatusBar style="auto" />

      <Stack
        // Only display the sign out button if the user is signed in.
        {...(authState.token && {
          screenOptions: {
            headerRight: SignOutButton,
          },
        })}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerLargeTitle: true,
            headerSearchBarOptions: {
              onChangeText: (event) => {
                // Update the query params to match the search query.
                router.setParams({
                  q: event.nativeEvent.text,
                });
              },
            },
          }}
        />
      </Stack>
    </>
  );
}

function SignOutButton() {
  const { onLogout } = useAuth();

  return (
    <Link
      href="/signin"
      onPress={(ev) => {
        ev.preventDefault();
        onLogout();
      }}
      asChild
    >
      <Pressable
        style={{
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          paddingRight: 8,
        }}
      >
        <Text
          style={{
            fontWeight: "normal",
            paddingHorizontal: 8,
            fontSize: 16,
          }}
        >
          Sign Out
        </Text>
        <FontAwesome name="sign-out" size={24} color="black" />
      </Pressable>
    </Link>
  );
}

function DismissComposeButton() {
  return (
    <Link href="..">
      <Text
        style={{
          fontWeight: "normal",
          paddingHorizontal: 8,
          fontSize: 16,
        }}
      >
        Back
      </Text>
    </Link>
  );
}
