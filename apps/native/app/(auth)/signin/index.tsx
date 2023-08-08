import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, StyleSheet, View } from "react-native";

import { useAuth } from "../../../context/auth";
import { useRouter } from "expo-router";

export default function Signin() {
  const { onLogin } = useAuth();
  const router = useRouter();
  const [email, onChangeEmail] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const submitEmail = useCallback(async () => {
    try {
      await onLogin(email);
      router.replace("/authenticate");
    } catch (e) {
      setAuthError("There was an error signing in this email.");
    }
  }, [email]);

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        aria-label="email"
        placeholder="email"
        style={styles.input}
        onChangeText={onChangeEmail}
        value={email}
      ></TextInput>
      <Pressable style={styles.submitButton} onPress={submitEmail}>
        <Text style={styles.buttonText}>Get email code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontWeight: "bold",
    marginBottom: 20,
    fontSize: 36,
  },
  button: {
    width: 200,
    height: 44,
    marginTop: 20,
  },
  submitButton: {
    width: 300,
    height: 44,
    marginTop: 8,
    backgroundColor: "slateblue",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  input: {
    width: 300,
    height: 44,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "slateblue",
    borderRadius: 4,
  },
});
