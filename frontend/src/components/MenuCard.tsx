import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import type { MenuItem } from "../data/menu";

interface Props {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAdd }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAdd(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add to Table</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1b16",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2e2820",
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#2a2519",
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f0e8d8",
    flex: 1,
    marginRight: 8,
  },
  tagBadge: {
    backgroundColor: "#2a2519",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3a3228",
  },
  tagText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#c9a96e",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 11,
    color: "#7a7060",
    lineHeight: 16,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#c9a96e",
  },
  addButton: {
    backgroundColor: "#c9a96e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.3,
  },
});
