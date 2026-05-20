import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { CartItem } from "./OrderTicketModal";

interface Props {
  cart: CartItem[];
  onViewTicket: () => void;
}

export default function FloatingCartBar({ cart, onViewTicket }: Props) {
  if (cart.length === 0) return null;

  const itemCount = cart.reduce((s, ci) => s + ci.quantity, 0);
  const subtotal = cart.reduce((s, ci) => s + ci.item.price * ci.quantity, 0);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onViewTicket}
      activeOpacity={0.9}
    >
      <View style={styles.left}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
        <Text style={styles.label}>🎫 Live Order Ticket</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.subtotal}>${subtotal}</Text>
        <Text style={styles.viewText}>View →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1714",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#c9a96e",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#c9a96e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111111",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e8dcc8",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtotal: {
    fontSize: 17,
    fontWeight: "700",
    color: "#c9a96e",
    marginRight: 12,
  },
  viewText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8a7e6b",
  },
});
