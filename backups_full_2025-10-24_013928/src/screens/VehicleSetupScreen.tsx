import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VehicleSetupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de configuração do veículo ⚙️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});
