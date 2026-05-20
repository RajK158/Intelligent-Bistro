export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
}

export const menuItems: MenuItem[] = [
  {
    id: "spicy_chicken_sandwich",
    name: "Spicy Chicken Sandwich",
    description: "Crispy buttermilk chicken, sriracha mayo, pickled slaw",
    category: "Mains",
    price: 18,
  },
  {
    id: "truffle_wagyu_burger",
    name: "Truffle Wagyu Burger",
    description: "A5 wagyu patty with black truffle aioli, aged gruyère, brioche",
    category: "Chef Picks",
    price: 34,
  },
  {
    id: "lobster_bisque",
    name: "Lobster Bisque",
    description: "Creamy Maine lobster bisque with cognac cream and chive oil",
    category: "Chef Picks",
    price: 24,
  },
  {
    id: "garden_risotto",
    name: "Garden Risotto",
    description: "Arborio rice with seasonal vegetables and aged parmesan foam",
    category: "Mains",
    price: 26,
  },
  {
    id: "charred_cauliflower_steak",
    name: "Charred Cauliflower Steak",
    description: "Whole roasted cauliflower with romesco, capers, and herb gremolata",
    category: "Mains",
    price: 22,
  },
  {
    id: "pan_seared_salmon",
    name: "Pan-Seared Salmon",
    description: "Atlantic salmon with citrus beurre blanc and asparagus",
    category: "Chef Picks",
    price: 42,
  },
  {
    id: "rosemary_fries",
    name: "Rosemary Fries",
    description: "Hand-cut triple-fried potatoes with rosemary salt and truffle dip",
    category: "Sides",
    price: 12,
  },
  {
    id: "large_still_water",
    name: "Large Still Water",
    description: "Premium still mineral water, 750ml bottle",
    category: "Drinks",
    price: 6,
  },
  {
    id: "sparkling_water",
    name: "Sparkling Water",
    description: "Fine sparkling mineral water with natural carbonation",
    category: "Drinks",
    price: 7,
  },
  {
    id: "mango_cooler",
    name: "Mango Cooler",
    description: "Fresh mango purée, lime, sparkling water, and mint",
    category: "Drinks",
    price: 9,
  },
  {
    id: "iced_citrus_tea",
    name: "Iced Citrus Tea",
    description: "House-brewed black tea with orange, lemon, and raw honey",
    category: "Drinks",
    price: 8,
  },
  {
    id: "chocolate_souffle",
    name: "Chocolate Soufflé",
    description: "Warm Valrhona chocolate soufflé with crème anglaise",
    category: "Dessert",
    price: 18,
  },
  {
    id: "vanilla_bean_panna_cotta",
    name: "Vanilla Bean Panna Cotta",
    description: "Silky Tahitian vanilla custard with berry compote and pistachios",
    category: "Dessert",
    price: 15,
  },
];

export function getMenuSummary(): string {
  return menuItems
    .map((i) => `- ${i.id}: ${i.name} ($${i.price}) — ${i.description} [${i.category}]`)
    .join("\n");
}
