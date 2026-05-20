import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HeroSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.logoMark}>✦</Text>
      <Text style={styles.title}>Velora Bistro</Text>
      <View style={styles.divider} />
      <Text style={styles.subtitle}>Your AI-powered dining concierge</Text>
      <Text style={styles.hint}>Tap V to build your order with AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 24,
    backgroundColor: "#111111",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2319",
  },
  logoMark: {
    fontSize: 22,
    color: "#c9a96e",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f5f0e8",
    letterSpacing: 3,
  },
  divider: {
    width: 32,
    height: 1.5,
    backgroundColor: "#c9a96e",
    marginVertical: 8,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 11,
    color: "#8a7e6b",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  hint: {
    fontSize: 11,
    color: "#5a5347",
    marginTop: 8,
    letterSpacing: 0.5,
    fontStyle: "italic",
  },
});
