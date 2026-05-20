import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { menuItems, MenuItem } from "../data/menu";
import { CartItem } from "./OrderTicketModal";

const API_BASE_URL = "http://localhost:4000";

const SHEET_HEIGHT = Dimensions.get("window").height * 0.6;

const promptChips = [
  "Add two spicy chicken sandwiches",
  "Suggest a drink under $10",
  "Make it vegetarian",
  "Remove dessert",
];

interface ChatMessage {
  id: string;
  role: "v" | "user";
  text: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s$]/g, "").trim();
}

function findByKeywords(keywords: string[]): MenuItem[] {
  return menuItems.filter((item) => {
    const name = normalize(item.name);
    return keywords.some((kw) => name.includes(kw));
  });
}

function findUnderPrice(max: number): MenuItem[] {
  return menuItems.filter((i) => i.price < max);
}

function formatList(items: MenuItem[]): string {
  return items.map((i) => `${i.name} ($${i.price})`).join(", ");
}

function findItemByName(msg: string): MenuItem | undefined {
  const m = normalize(msg);
  return menuItems.find((item) => {
    const words = normalize(item.name).split(/\s+/);
    const matched = words.filter((w) => w.length > 2 && m.includes(w));
    return matched.length >= 2 || (words.length <= 2 && matched.length >= 1);
  });
}

interface VResult {
  text: string;
  suggested: MenuItem[];
  addItem?: MenuItem;
}

function generateResponse(msg: string, lastSuggested: MenuItem[]): VResult {
  const m = normalize(msg);

  if (m.includes("no") && (m.includes("thanks") || m.includes("thank") || m.includes("not now") || m === "no")) {
    return { text: "No problem! Let me know if you change your mind.", suggested: [] };
  }

  if (m.includes("clear cart") || m.includes("remove everything") || m.includes("empty cart")) {
    return {
      text: "Cart clearing will be available after AI integration. For now, use the Live Order Ticket to remove items.",
      suggested: [],
    };
  }

  if (
    (m.includes("add") && (m.includes("first") || m.includes("yes"))) ||
    m === "yes add it" ||
    m === "yes" ||
    m.includes("add it") ||
    m.includes("add the first")
  ) {
    if (lastSuggested.length > 0) {
      const item = lastSuggested[0] as MenuItem;
      return {
        text: `Added ${item.name} to your table.`,
        suggested: [],
        addItem: item,
      };
    }
    return { text: "I don't have a previous suggestion to add. Tell me what you'd like!", suggested: [] };
  }

  const directItem = findItemByName(msg);
  if (m.includes("add") && directItem) {
    return {
      text: `Added ${directItem.name} to your table.`,
      suggested: [],
      addItem: directItem,
    };
  }

  if (m.includes("veg") || m.includes("plant") || m.includes("meatless") || m.includes("no meat")) {
    const items = menuItems.filter((i) =>
      ["Vegetarian", "Plant-Based"].includes(i.tag) || i.name === "Garden Risotto" || i.name === "Charred Cauliflower Steak"
    );
    const unique = [...new Map(items.map((i) => [i.id, i])).values()];
    return {
      text: `For vegetarian options, I recommend ${formatList(unique)}. Want me to add one?`,
      suggested: unique,
    };
  }

  if (m.includes("spicy")) {
    const items = findByKeywords(["spicy"]);
    if (items.length > 0) {
      return {
        text: `For something spicy, try ${formatList(items)}. Want me to add it?`,
        suggested: items,
      };
    }
  }

  if (m.includes("sandwich")) {
    const items = findByKeywords(["sandwich"]);
    if (items.length > 0) {
      return {
        text: `I'd suggest ${formatList(items)}. Crispy buttermilk chicken with sriracha mayo. Want me to add it?`,
        suggested: items,
      };
    }
  }

  if (m.includes("burger") || m.includes("wagyu")) {
    const items = findByKeywords(["burger", "wagyu"]);
    if (items.length > 0) {
      return {
        text: `Our ${formatList(items)} is a showstopper — A5 wagyu with truffle aioli. Want me to add it?`,
        suggested: items,
      };
    }
  }

  if (m.includes("salmon") || m.includes("fish") || m.includes("seafood")) {
    const items = findByKeywords(["salmon", "lobster"]);
    if (items.length > 0) {
      return {
        text: `For seafood, we have ${formatList(items)}. Want me to add one?`,
        suggested: items,
      };
    }
  }

  if (m.includes("dessert") || m.includes("sweet") || m.includes("chocolate")) {
    const items = menuItems.filter((i) => i.category === "Dessert");
    return {
      text: `For dessert, I recommend ${formatList(items)}. Want me to add one?`,
      suggested: items,
    };
  }

  if (m.includes("drink") || m.includes("water") || m.includes("cooler") || m.includes("tea") || m.includes("beverage") || m.includes("thirsty")) {
    const items = menuItems.filter((i) => i.category === "Drinks");
    return {
      text: `I recommend ${formatList(items)}. Want me to add one?`,
      suggested: items,
    };
  }

  const priceMatch = m.match(/under\s*\$?(\d+)/);
  const belowMatch = m.match(/below\s*\$?(\d+)/);
  const priceLimit = priceMatch?.[1] || belowMatch?.[1];
  if (priceLimit) {
    const max = parseInt(priceLimit, 10);
    const items = findUnderPrice(max);
    if (items.length > 0) {
      return {
        text: `Under $${max}: ${formatList(items)}. Want me to add any?`,
        suggested: items,
      };
    }
    return { text: `Nothing under $${max} on our menu. Our most affordable item starts at $${Math.min(...menuItems.map((i) => i.price))}.`, suggested: [] };
  }

  if (m.includes("fries") || m.includes("side") || m.includes("rosemary")) {
    const items = findByKeywords(["fries", "rosemary"]);
    if (items.length > 0) {
      return {
        text: `Our ${formatList(items)} are hand-cut and triple-fried with truffle dip. Want me to add them?`,
        suggested: items,
      };
    }
  }

  if (m.includes("lobster") || m.includes("bisque") || m.includes("soup")) {
    const items = findByKeywords(["lobster", "bisque"]);
    if (items.length > 0) {
      return {
        text: `Our ${formatList(items)} is a signature classic with cognac cream. Want me to add it?`,
        suggested: items,
      };
    }
  }

  if (m.includes("mango")) {
    const items = findByKeywords(["mango"]);
    if (items.length > 0) {
      return {
        text: `${formatList(items)} — fresh mango, lime, sparkling water, and mint. Want me to add it?`,
        suggested: items,
      };
    }
  }

  if (m.includes("recommend") || m.includes("suggest") || m.includes("what should") || m.includes("popular") || m.includes("best")) {
    const picks = menuItems.filter((i) => ["Popular", "Chef's Pick", "Signature"].includes(i.tag));
    return {
      text: `Our top picks: ${formatList(picks)}. Want me to add any?`,
      suggested: picks,
    };
  }

  if (m.includes("hello") || m.includes("hi") || m.includes("hey")) {
    return { text: "Hey! I'm V, your dining concierge. What are you in the mood for?", suggested: [] };
  }

  if (m.includes("thanks") || m.includes("thank you")) {
    return { text: "My pleasure! Enjoy your meal at Velora Bistro. ✦", suggested: [] };
  }

  if (m.includes("help") || m.includes("what can you do")) {
    return {
      text: "I can suggest dishes, filter by diet or price, and add items to your table. Just ask naturally!",
      suggested: [],
    };
  }

  if (m.includes("menu") || m.includes("what do you have")) {
    return {
      text: `We have ${menuItems.length} items across Chef Picks, Mains, Sides, Drinks, and Dessert. What are you in the mood for?`,
      suggested: [],
    };
  }

  if (m.includes("remove")) {
    return {
      text: "To remove items, open your Live Order Ticket and use the − button. Need anything else?",
      suggested: [],
    };
  }

  if (directItem) {
    return {
      text: `${directItem.name} ($${directItem.price}) — ${directItem.description}. Want me to add it?`,
      suggested: [directItem],
    };
  }

  return {
    text: "I'm not sure about that one. Try asking about specific dishes, dietary preferences, or price ranges!",
    suggested: [],
  };
}

function deriveChipsFromReply(reply: string): string[] {
  const cleanReply = reply.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const found: { name: string; index: number }[] = [];

  for (const item of menuItems) {
    const cleanItemName = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const idx = cleanReply.indexOf(cleanItemName);
    if (idx !== -1) {
      found.push({ name: item.name, index: idx });
    }
  }

  found.sort((a, b) => a.index - b.index);
  return found.map((f) => `Add ${f.name}`);
}

export default function AIOrderingModal({ visible, onClose, cart, setCart }: Props) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "v",
      text: "Welcome to Velora Bistro. Tell me what you're craving and I'll help build your order.",
    },
  ]);
  const [lastSuggested, setLastSuggested] = useState<MenuItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chips, setChips] = useState<string[]>(promptChips);
  const chatScrollRef = useRef<ScrollView>(null);
  const idCounter = useRef(1);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [visible]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const userText = text.trim();
    const userId = `user-${idCounter.current++}`;

    setMessages((prev) => [...prev, { id: userId, role: "user", text: userText }]);
    setText("");
    scrollToBottom();
    setIsTyping(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role === "v" ? "assistant" : "user",
        content: m.text,
      }));

      const formattedCart = cart.map((ci) => ({
        itemId: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
      }));

      const response = await fetch(`${API_BASE_URL}/api/ai/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          cart: formattedCart,
          history: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setIsTyping(false);

      const vId = `v-${idCounter.current++}`;
      setMessages((prev) => [...prev, { id: vId, role: "v", text: data.reply }]);

      let finalSuggestions: string[] = [];
      if (data.suggestions && Array.isArray(data.suggestions)) {
        finalSuggestions = [...data.suggestions];
      }

      const derived = deriveChipsFromReply(data.reply);
      for (const d of derived) {
        if (!finalSuggestions.some((s) => s.toLowerCase().includes(d.toLowerCase()))) {
          finalSuggestions.push(d);
        }
      }

      if (finalSuggestions.length === 0) {
        setChips(promptChips);
      } else {
        setChips(finalSuggestions);
      }

      if (data.actions && Array.isArray(data.actions)) {
        setCart((prev) => {
          let newCart = [...prev];
          for (const action of data.actions) {
            if (action.type === "ADD_ITEM") {
              const item = menuItems.find((i) => i.id === action.itemId);
              if (item) {
                const qty = action.quantity ?? 1;
                const existing = newCart.find((ci) => ci.item.id === item.id);
                if (existing) {
                  newCart = newCart.map((ci) =>
                    ci.item.id === item.id ? { ...ci, quantity: ci.quantity + qty } : ci
                  );
                } else {
                  newCart.push({ item, quantity: qty });
                }
              }
            } else if (action.type === "REMOVE_ITEM") {
              newCart = newCart.filter((ci) => ci.item.id !== action.itemId);
            } else if (action.type === "UPDATE_QUANTITY") {
              const item = menuItems.find((i) => i.id === action.itemId);
              if (item) {
                const qty = action.quantity ?? 0;
                if (qty <= 0) {
                  newCart = newCart.filter((ci) => ci.item.id !== action.itemId);
                } else {
                  const existing = newCart.find((ci) => ci.item.id === item.id);
                  if (existing) {
                    newCart = newCart.map((ci) =>
                      ci.item.id === item.id ? { ...ci, quantity: qty } : ci
                    );
                  } else {
                    newCart.push({ item, quantity: qty });
                  }
                }
              }
            } else if (action.type === "CLEAR_CART") {
              newCart = [];
            }
          }
          return newCart;
        });
      }
      scrollToBottom();
    } catch (err) {
      console.error(err);
      const result = generateResponse(userText, lastSuggested);
      setIsTyping(false);

      const vId = `v-${idCounter.current++}`;
      setMessages((prev) => [...prev, { id: vId, role: "v", text: result.text }]);

      if (result.suggested.length > 0) {
        setLastSuggested(result.suggested);
      }

      let finalSuggestions: string[] = [];
      const derived = deriveChipsFromReply(result.text);
      for (const d of derived) {
        if (!finalSuggestions.some((s) => s.toLowerCase().includes(d.toLowerCase()))) {
          finalSuggestions.push(d);
        }
      }

      if (finalSuggestions.length === 0) {
        setChips(promptChips);
      } else {
        setChips(finalSuggestions);
      }

      if (result.addItem) {
        setCart((prev) => {
          const existing = prev.find((ci) => ci.item.id === result.addItem?.id);
          if (existing) {
            return prev.map((ci) =>
              ci.item.id === result.addItem?.id ? { ...ci, quantity: ci.quantity + 1 } : ci
            );
          }
          return [...prev, { item: result.addItem!, quantity: 1 }];
        });
      }
      scrollToBottom();
    }
  };

  const handleChip = (chip: string) => {
    setText(chip);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={[styles.sheet, { maxHeight: SHEET_HEIGHT }]}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.miniAvatar}>
                  <Text style={styles.miniV}>V</Text>
                </View>
                <View>
                  <Text style={styles.title}>V at your table</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Ready</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={chatScrollRef}
              style={styles.chatArea}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.role === "user" ? styles.userBubble : styles.vBubble,
                  ]}
                >
                  {msg.role === "v" && <Text style={styles.vLabel}>✦ V</Text>}
                  <Text
                    style={[
                      styles.messageText,
                      msg.role === "user" ? styles.userText : styles.vText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
              {isTyping && (
                <View style={[styles.messageBubble, styles.vBubble]}>
                  <Text style={styles.vLabel}>✦ V</Text>
                  <Text style={styles.typingText}>V is thinking...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.bottomSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsContainer}
                keyboardShouldPersistTaps="handled"
              >
                {chips.map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={styles.chip}
                    onPress={() => handleChip(chip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={setText}
                  placeholder="Tell V what you'd like..."
                  placeholderTextColor="#5a5347"
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !text.trim() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  activeOpacity={0.8}
                  disabled={!text.trim()}
                >
                  <Text style={styles.sendText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1a1714",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "#2e2820",
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3a3228",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2519",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#c9a96e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  miniV: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e8dcc8",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6dbf6d",
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    color: "#6b6155",
    fontWeight: "500",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#252017",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3a3228",
  },
  closeText: {
    fontSize: 13,
    color: "#8a7e6b",
    fontWeight: "600",
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  chatContent: {
    paddingBottom: 8,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    maxWidth: "85%",
  },
  vBubble: {
    backgroundColor: "#252017",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#2e2820",
  },
  userBubble: {
    backgroundColor: "#c9a96e",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  vLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#c9a96e",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  vText: {
    color: "#ddd2be",
  },
  userText: {
    color: "#111111",
    fontWeight: "500",
  },
  bottomSection: {
    paddingTop: 8,
    paddingBottom: Platform.OS === "android" ? 12 : 24,
    borderTopWidth: 1,
    borderTopColor: "#2a2519",
    backgroundColor: "#1a1714",
  },
  chipsScroll: {
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
  chipsContainer: {
    gap: 8,
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  chip: {
    backgroundColor: "#252017",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#3a3228",
  },
  chipText: {
    fontSize: 12,
    color: "#a99b80",
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#131110",
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#e8dcc8",
    borderWidth: 1,
    borderColor: "#2e2820",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#c9a96e",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#3a3228",
  },
  sendText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  typingText: {
    fontSize: 14,
    color: "#8a7e6b",
    fontStyle: "italic",
  },
});
