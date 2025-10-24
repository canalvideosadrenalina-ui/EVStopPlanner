import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EV Eletrificados Stop Planner ⚡</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Map" as never)}
      >
        <Text style={styles.buttonText}>Ver mapa de estações</Text>
      </TouchableOpacity>

      {/* frase de patrocínio */}
      <Text style={styles.sponsor}>Patrocínio Canal Eletrificados YouTube</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B132B" },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 40 },
  button: {
    backgroundColor: "#3A86FF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  sponsor: {
    position: "absolute",
    bottom: 40,
    textAlign: "center",
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "bold",
  },
});
