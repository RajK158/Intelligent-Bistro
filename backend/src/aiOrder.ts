import OpenAI from "openai";
import { z } from "zod";
import { getMenuSummary, menuItems } from "./menu";

const ActionTypeSchema = z.enum([
  "ADD_ITEM",
  "REMOVE_ITEM",
  "UPDATE_QUANTITY",
  "CLEAR_CART",
  "NONE",
]);

const ActionSchema = z.object({
  type: ActionTypeSchema,
  itemId: z.string().optional(),
  quantity: z.number().optional(),
});

const AIResponseSchema = z.object({
  reply: z.string(),
  actions: z.array(ActionSchema),
  suggestions: z.array(z.string()),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

export const OrderRequestSchema = z.object({
  message: z.string().min(1),
  cart: z.array(z.any()),
  history: z.array(z.any()),
});

const SYSTEM_PROMPT = `You are V, the AI dining concierge at Velora Bistro — a premium dark-luxury restaurant.

Your role:
- Help guests build their table order through natural conversation.
- Suggest dishes based on preferences, dietary needs, and price.
- Only reference items from the Velora Bistro menu below.
- Never invent menu items that do not exist.
- Keep replies short, polished, warm, and natural (1-2 sentences).

Menu:
${getMenuSummary()}

Valid item IDs: ${menuItems.map((i) => i.id).join(", ")}

Conversation History:
The conversation history is provided as an array of messages containing the previous user and assistant/V messages. You must use this history to resolve contextual follow-ups such as "add the first one", "add the second one", or "yes add it" by identifying the items mentioned in the most recent assistant message.

You must respond with ONLY valid JSON matching this exact shape:
{
  "reply": "your conversational response",
  "actions": [
    {
      "type": "ADD_ITEM" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "CLEAR_CART" | "NONE",
      "itemId": "item_id (optional)",
      "quantity": number (optional, default 1)
    }
  ],
  "suggestions": ["optional follow-up suggestion strings"]
}

Rules:
- If the guest asks for suggestions or information, use type "NONE" with an empty actions array.
- If the guest asks to add items, use "ADD_ITEM" with the correct itemId and quantity.
- If the guest asks to remove items, use "REMOVE_ITEM" with the correct itemId.
- If the guest asks to change quantity, use "UPDATE_QUANTITY" with itemId and new quantity.
- If the guest says "clear cart" or "remove everything", use "CLEAR_CART".
- For follow-up messages like "add the first one" or "yes add it", infer the item from conversation history.
- Always use item IDs from the menu list, never make up IDs.
- Do not include any text outside the JSON object.`;

const WORD_TO_NUM: Record<string, number> = {
  a: 1, an: 1, one: 1, "1": 1,
  two: 2, "2": 2,
  three: 3, "3": 3,
  four: 4, "4": 4,
  five: 5, "5": 5,
};

const PLURAL_MAP: Record<string, string> = {
  sandwiches: "sandwich",
  burgers: "burger",
  coolers: "cooler",
  waters: "water",
  teas: "tea",
  fries: "fries",
  steaks: "steak",
  souffles: "souffle",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function singularize(word: string): string {
  return PLURAL_MAP[word] || word;
}

function matchItem(segment: string): { item: typeof menuItems[number]; qty: number } | null {
  const words = normalize(segment).split(/\s+/).map(singularize);

  let qty = 1;
  for (let i = 0; i < words.length; i++) {
    const w = words[i] as string;
    if (WORD_TO_NUM[w] !== undefined) {
      qty = WORD_TO_NUM[w] as number;
      words.splice(i, 1);
      break;
    }
  }

  let bestMatch: typeof menuItems[number] | null = null;
  let bestScore = 0;

  for (const item of menuItems) {
    const itemWords = normalize(item.name).split(/\s+/).map(singularize);
    const matched = itemWords.filter((iw) => words.includes(iw));
    const score = matched.length;
    if (score >= 2 || (itemWords.length <= 2 && score >= 1)) {
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  if (bestMatch) {
    return { item: bestMatch, qty };
  }

  for (const item of menuItems) {
    const nameNorm = normalize(item.name);
    const segNorm = words.join(" ");
    const stopWords = ["the", "one", "it", "and", "all", "any", "me", "yes", "no"];
    if (segNorm.length >= 3 && !stopWords.includes(segNorm)) {
      if (nameNorm.includes(segNorm) || segNorm.includes(nameNorm)) {
        return { item, qty };
      }
    }
    const nameWords = nameNorm.split(/\s+/).map(singularize);
    for (const nw of nameWords) {
      if (nw.length > 3 && words.includes(nw) && !stopWords.includes(nw)) {
        return { item, qty };
      }
    }
  }

  return null;
}

function parseAddCommand(msg: string): AIResponse | null {
  if (!msg.includes("add")) return null;

  const afterAdd = msg.substring(msg.indexOf("add") + 3).trim();
  if (!afterAdd) return null;

  const segments = afterAdd.split(/\s+and\s+/);
  const actions: AIResponse["actions"] = [];
  const names: string[] = [];

  for (const seg of segments) {
    const result = matchItem(seg.trim());
    if (result) {
      actions.push({
        type: "ADD_ITEM",
        itemId: result.item.id,
        quantity: result.qty,
      });
      const name = result.item.name;
      let plural = name;
      if (name.match(/s$/i)) {
        plural = name;
      } else if (name.match(/[cs]h$/i) || name.match(/x$/i)) {
        plural = `${name}es`;
      } else {
        plural = `${name}s`;
      }
      const label = result.qty > 1
        ? `${result.qty} ${plural}`
        : `${result.qty} ${result.item.name}`;
      names.push(label);
    }
  }

  if (actions.length === 0) return null;

  return {
    reply: `Added ${names.join(" and ")} to your table.`,
    actions,
    suggestions: [],
  };
}

function parseRemoveCommand(msg: string): AIResponse | null {
  if (!msg.includes("remove") || msg.includes("remove everything")) return null;

  const afterRemove = msg.substring(msg.indexOf("remove") + 6).trim();
  if (!afterRemove) return null;

  const result = matchItem(afterRemove);
  if (!result) return null;

  return {
    reply: `Removed ${result.item.name} from your table.`,
    actions: [{ type: "REMOVE_ITEM", itemId: result.item.id }],
    suggestions: [],
  };
}

function parseUpdateCommand(msg: string): AIResponse | null {
  const changeMatch = msg.match(/(?:change|make|set|update)\s+(.+?)\s+(?:to|=)\s+(\d+|one|two|three|four|five)/);
  if (!changeMatch) return null;

  const itemPart = changeMatch[1] as string;
  const qtyWord = changeMatch[2] as string;
  const qty = WORD_TO_NUM[qtyWord] ?? parseInt(qtyWord, 10);
  if (!qty || isNaN(qty)) return null;

  const result = matchItem(itemPart);
  if (!result) return null;

  return {
    reply: `Updated ${result.item.name} quantity to ${qty}.`,
    actions: [{ type: "UPDATE_QUANTITY", itemId: result.item.id, quantity: qty }],
    suggestions: [],
  };
}

function cleanString(s: string): string {
  let cleaned = s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  cleaned = cleaned.replace(/Ã©/g, "e").replace(/â/g, "e").replace(/souffl[^\s]+/g, "souffle");
  return cleaned
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function getNonVegetarianSuggestions(): AIResponse {
  const suggestions = [
    "Add Spicy Chicken Sandwich",
    "Add Truffle Wagyu Burger",
    "Add Lobster Bisque",
  ];

  if (menuItems.some((item) => item.id === "pan_seared_sea_bass")) {
    suggestions.push("Add Pan-Seared Sea Bass");
  }

  return {
    reply: "I can suggest Spicy Chicken Sandwich, Truffle Wagyu Burger, or Lobster Bisque.",
    actions: [],
    suggestions,
  };
}

const ITEM_ALIASES: Record<string, string[]> = {
  spicy_chicken_sandwich: ["spicy chicken sandwich", "spicy chicken", "chicken sandwich", "sandwich"],
  truffle_wagyu_burger: ["truffle wagyu burger", "wagyu burger", "wagyu", "burger"],
  lobster_bisque: ["lobster bisque", "lobster", "bisque"],
  garden_risotto: ["garden risotto", "risotto"],
  charred_cauliflower_steak: ["charred cauliflower steak", "cauliflower steak", "cauliflower"],
  pan_seared_salmon: ["pan-seared salmon", "seared salmon", "salmon"],
  rosemary_fries: ["rosemary fries", "fries"],
  large_still_water: ["large still water", "still water", "water"],
  sparkling_water: ["sparkling water", "sparkling"],
  mango_cooler: ["mango cooler", "mango"],
  iced_citrus_tea: ["iced citrus tea", "iced tea", "tea"],
  chocolate_souffle: ["chocolate souffle", "souffle"],
  vanilla_bean_panna_cotta: ["vanilla bean panna cotta", "panna cotta", "custard"],
};

function extractItemsFromHistory(history: unknown[]): typeof menuItems[number][] {
  const found: { item: typeof menuItems[number]; index: number }[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (
      typeof entry === "object" &&
      entry !== null &&
      "role" in entry &&
      "content" in entry
    ) {
      const e = entry as { role: string; content: string };
      if (e.role === "assistant" || e.role === "v") {
        const content = cleanString(e.content);
        for (const item of menuItems) {
          const aliases = ITEM_ALIASES[item.id] || [item.name];
          let earliestIndex = -1;
          for (const alias of aliases) {
            const cleanAlias = cleanString(alias);
            const idx = content.indexOf(cleanAlias);
            if (idx !== -1) {
              if (earliestIndex === -1 || idx < earliestIndex) {
                earliestIndex = idx;
              }
            }
          }
          if (earliestIndex !== -1) {
            found.push({ item, index: earliestIndex });
          }
        }
        if (found.length > 0) {
          found.sort((a, b) => a.index - b.index);
          break;
        }
      }
    }
  }

  return found.map((f) => f.item);
}

function resolveFollowUp(msg: string, history: unknown[]): AIResponse | null {
  const m = msg.toLowerCase();
  if (m.includes("suggest") || m.includes("recommend") || m.includes("what")) {
    return null;
  }
  const isFollowUp =
    m.includes("first") ||
    m.includes("second") ||
    m.includes("third") ||
    m.includes("yes") ||
    m.includes("sure") ||
    m.includes("add it") ||
    m.includes("add one") ||
    m === "add";

  if (!isFollowUp) return null;

  const items = extractItemsFromHistory(history);
  if (items.length === 0) return null;

  let index = 0;
  if (m.includes("second")) {
    index = 1;
  } else if (m.includes("third")) {
    index = 2;
  }

  const target = items[index] || items[0];
  if (!target) return null;

  return {
    reply: `Added ${target.name} to your table.`,
    actions: [{ type: "ADD_ITEM", itemId: target.id, quantity: 1 }],
    suggestions: ["Suggest a drink", "View ticket"],
  };
}

function buildFallbackResponse(message: string, history: unknown[] = []): AIResponse {
  const msg = message.toLowerCase();

  if (msg.includes("clear cart") || msg.includes("remove everything") || msg.includes("empty cart")) {
    return {
      reply: "Cart cleared. Ready to start fresh whenever you are.",
      actions: [{ type: "CLEAR_CART" }],
      suggestions: [],
    };
  }

  const updateResult = parseUpdateCommand(msg);
  if (updateResult) return updateResult;

  const removeResult = parseRemoveCommand(msg);
  if (removeResult) return removeResult;

  const addResult = parseAddCommand(msg);
  if (addResult) return addResult;

  const followUpResult = resolveFollowUp(msg, history);
  if (followUpResult) return followUpResult;

  if (msg.includes("pizza")) {
    return {
      reply: "Pizza is not on Velora Bistro's menu, but I can suggest Spicy Chicken Sandwich, Truffle Wagyu Burger, or Lobster Bisque.",
      actions: [],
      suggestions: ["Add Spicy Chicken Sandwich", "Add Truffle Wagyu Burger", "Add Lobster Bisque"],
    };
  }

  const isNonVegetarianRequest = includesAny(msg, [
    "non veg",
    "nonveg",
    "non-veg",
    "non vegetarian",
    "nonvegetarian",
    "non-vegetarian",
    "meat",
    "chicken",
    "burger",
    "seafood",
  ]);

  const isVegetarianRequest = !isNonVegetarianRequest && includesAny(msg, [
    "veg",
    "vegetarian",
    "plant",
    "meatless",
    "no meat",
  ]);

  if (isNonVegetarianRequest) {
    return getNonVegetarianSuggestions();
  }

  if (isVegetarianRequest) {
    return {
      reply: "For vegetarian options, I recommend Garden Risotto ($26) or Charred Cauliflower Steak ($22). Want me to add one?",
      actions: [],
      suggestions: ["Add Garden Risotto", "Add Cauliflower Steak"],
    };
  }

  if (msg.includes("dessert") || msg.includes("sweet") || msg.includes("chocolate")) {
    return {
      reply: "For dessert, I recommend Chocolate Soufflé ($18) or Vanilla Bean Panna Cotta ($15).",
      actions: [],
      suggestions: ["Add Chocolate Soufflé", "Add Panna Cotta"],
    };
  }

  if (msg.includes("drink") || msg.includes("beverage") || msg.includes("thirsty")) {
    return {
      reply: "We have Mango Cooler ($9), Iced Citrus Tea ($8), Large Still Water ($6), and Sparkling Water ($7).",
      actions: [],
      suggestions: ["Add Mango Cooler", "Add Iced Citrus Tea"],
    };
  }

  if (msg.includes("spicy")) {
    return {
      reply: "For something with a kick, try our Spicy Chicken Sandwich ($18). Want me to add it?",
      actions: [],
      suggestions: ["Add Spicy Chicken Sandwich"],
    };
  }

  if (msg.includes("sandwich")) {
    return {
      reply: "Our Spicy Chicken Sandwich ($18) is a crowd favorite — crispy buttermilk chicken with sriracha mayo. Want me to add it?",
      actions: [],
      suggestions: ["Add Spicy Chicken Sandwich"],
    };
  }

  if (msg.includes("burger") || msg.includes("wagyu")) {
    return {
      reply: "Our Truffle Wagyu Burger ($34) features A5 wagyu with black truffle aioli. Want me to add it?",
      actions: [],
      suggestions: ["Add Truffle Wagyu Burger"],
    };
  }

  if (msg.includes("salmon") || msg.includes("fish") || msg.includes("seafood")) {
    return getNonVegetarianSuggestions();
  }

  if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("popular") || msg.includes("best")) {
    return {
      reply: "Our top picks: Spicy Chicken Sandwich ($18), Truffle Wagyu Burger ($34), and Lobster Bisque ($24). Want me to add any?",
      actions: [],
      suggestions: ["Add Spicy Chicken Sandwich", "Add Truffle Wagyu Burger"],
    };
  }

  if (msg.includes("menu") || msg.includes("what do you have") || msg.includes("what do you serve")) {
    return {
      reply: `We have ${menuItems.length} items across Chef Picks, Mains, Sides, Drinks, and Dessert. What are you in the mood for?`,
      actions: [],
      suggestions: ["Show vegetarian options", "Suggest a drink", "What's popular?"],
    };
  }

  if (msg.includes("hello") || msg.includes("hi ") || msg.includes("hey") || msg === "hi") {
    return {
      reply: "Hey! I'm V, your dining concierge at Velora Bistro. What are you in the mood for?",
      actions: [],
      suggestions: ["Show the menu", "Suggest something popular"],
    };
  }

  if (msg.includes("thanks") || msg.includes("thank you")) {
    return {
      reply: "My pleasure! Enjoy your meal at Velora Bistro. ✦",
      actions: [],
      suggestions: [],
    };
  }

  if (msg.includes("help") || msg.includes("what can you do")) {
    return {
      reply: "I can suggest dishes, filter by diet or price, add items to your table, and manage your order. Just ask naturally!",
      actions: [],
      suggestions: ["Show vegetarian options", "Suggest a drink", "What's popular?"],
    };
  }

  return {
    reply: "I can help with menu suggestions, dietary preferences, and building your order. What are you in the mood for?",
    actions: [],
    suggestions: ["Show vegetarian options", "Suggest a drink", "What's popular?"],
  };
}

export async function processAIOrder(
  message: string,
  cart: unknown[],
  history: unknown[]
): Promise<AIResponse> {
  const followUpResult = resolveFollowUp(message, history);
  if (followUpResult) {
    return followUpResult;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackResponse(message, history);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    for (const entry of history) {
      if (
        typeof entry === "object" &&
        entry !== null &&
        "role" in entry &&
        "content" in entry
      ) {
        const e = entry as { role: string; content: string };
        if (e.role === "user" || e.role === "assistant") {
          messages.push({
            role: e.role as "user" | "assistant",
            content: e.content,
          });
        }
      }
    }

    if (cart.length > 0) {
      messages.push({
        role: "system",
        content: `Current cart: ${JSON.stringify(cart)}`,
      });
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return buildFallbackResponse(message, history);
    }

    const parsed = JSON.parse(raw);
    const validated = AIResponseSchema.parse(parsed);

    const hasNoActions = !validated.actions || validated.actions.length === 0 || validated.actions.every(a => a.type === "NONE");
    if (hasNoActions) {
      const resolved = resolveFollowUp(message, history) || parseAddCommand(message) || parseRemoveCommand(message) || parseUpdateCommand(message);
      if (resolved) {
        return resolved;
      }
    }

    return validated;
  } catch {
    return buildFallbackResponse(message, history);
  }
}
