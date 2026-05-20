import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import HeroSection from "./src/components/HeroSection";
import FloatingVButton, {
  FloatingVButtonRef,
} from "./src/components/FloatingVButton";
import AIOrderingModal from "./src/components/AIOrderingModal";
import MenuCard from "./src/components/MenuCard";
import FloatingCartBar from "./src/components/FloatingCartBar";
import OrderTicketModal, {
  CartItem,
} from "./src/components/OrderTicketModal";
import { menuItems, categories, MenuItem } from "./src/data/menu";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [ticketVisible, setTicketVisible] = useState(false);
  const vButtonRef = useRef<FloatingVButtonRef>(null);

  const filteredItems = useMemo(() => {
    if (!activeCategory) return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleAddItem = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    vButtonRef.current?.bounce();
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((ci) =>
          ci.item.id === id ? { ...ci, quantity: ci.quantity - 1 } : ci
        );
      }
      return prev.filter((ci) => ci.item.id !== id);
    });
  }, []);

  const handleAISend = useCallback((_message: string) => {}, []);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <StatusBar style="light" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            cart.length > 0 && styles.scrollContentWithCart,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <HeroSection />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !activeCategory && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(null)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  !activeCategory && styles.categoryTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  activeCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.menuList}>
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAddItem} />
            ))}
          </View>
        </ScrollView>

        <FloatingVButton
          ref={vButtonRef}
          onPress={() => setAiModalVisible(true)}
          hasCartItems={cart.length > 0}
        />

        <FloatingCartBar
          cart={cart}
          onViewTicket={() => setTicketVisible(true)}
        />

        <AIOrderingModal
          visible={aiModalVisible}
          onClose={() => setAiModalVisible(false)}
          cart={cart}
          setCart={setCart}
        />

        <OrderTicketModal
          visible={ticketVisible}
          cart={cart}
          onClose={() => setTicketVisible(false)}
          onAdd={handleAddItem}
          onRemove={handleRemoveItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#0a0908",
    alignItems: "center",
  },
  phoneFrame: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 430 : undefined,
    backgroundColor: "#131110",
    ...(Platform.OS === "web"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 40,
        }
      : {}),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithCart: {
    paddingBottom: 80,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e8dcc8",
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginTop: 10,
    marginBottom: 14,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
  categoryChip: {
    backgroundColor: "#1e1b16",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2e2820",
  },
  categoryChipActive: {
    backgroundColor: "#c9a96e",
    borderColor: "#c9a96e",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8a7e6b",
  },
  categoryTextActive: {
    color: "#111111",
  },
  menuList: {
    paddingHorizontal: 16,
  },
});
