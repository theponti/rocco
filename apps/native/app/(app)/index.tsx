import { StyleSheet, Text, Pressable, View } from "react-native";
import { Link } from "expo-router";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Rocco</Text>
      <Pressable style={styles.button}>
        <Link href="/(auth)/signin" style={styles.link}>
          <Text style={styles.text}>Sign in</Text>
        </Link>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  header: {
    fontWeight: "bold",
    marginBottom: 20,
    fontSize: 36,
  },
  button: {
    backgroundColor: "blue",
    borderRadius: 4,
    padding: 20,
    width: 200,
  },
  link: {
    textAlign: "center",
  },
  text: {
    fontWeight: "bold",
    paddingHorizontal: 8,
    fontSize: 16,
    color: "white",
  },
});
