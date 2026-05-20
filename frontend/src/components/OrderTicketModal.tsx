import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import type { MenuItem } from "../data/menu";

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface Props {
  visible: boolean;
  cart: CartItem[];
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
}

export default function OrderTicketModal({
  visible,
  cart,
  onClose,
  onAdd,
  onRemove,
}: Props) {
  const subtotal = cart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>🎫 Live Order Ticket</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Your ticket is empty</Text>
              <Text style={styles.emptyHint}>
                Add items from the menu or ask V to build your order
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.itemsScroll}
              showsVerticalScrollIndicator={false}
            >
              {cart.map((ci) => (
                <View key={ci.item.id} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {ci.item.name}
                    </Text>
                    <Text style={styles.itemUnitPrice}>
                      ${ci.item.price} each
                    </Text>
                  </View>
                  <View style={styles.rowRight}>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity
                        onPress={() => onRemove(ci.item.id)}
                        style={styles.qtyButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.qtyButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{ci.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => onAdd(ci.item)}
                        style={styles.qtyButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemPrice}>
                      ${ci.item.price * ci.quantity}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {cart.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>${subtotal}</Text>
              </View>
              <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8}>
                <Text style={styles.confirmText}>Confirm Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1a1714",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: "#2e2820",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3a3228",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2519",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e8dcc8",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#252017",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3a3228",
  },
  closeText: {
    fontSize: 14,
    color: "#8a7e6b",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a7060",
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: "#5a5347",
    textAlign: "center",
    lineHeight: 19,
  },
  itemsScroll: {
    maxHeight: 300,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2519",
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    color: "#ddd2be",
    fontWeight: "600",
  },
  itemUnitPrice: {
    fontSize: 11,
    color: "#6b6155",
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252017",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3a3228",
    marginRight: 14,
  },
  qtyButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#c9a96e",
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e8dcc8",
    minWidth: 22,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#c9a96e",
    minWidth: 44,
    textAlign: "right",
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#c9a96e",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8a7e6b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#c9a96e",
  },
  confirmButton: {
    backgroundColor: "#c9a96e",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.5,
  },
});
