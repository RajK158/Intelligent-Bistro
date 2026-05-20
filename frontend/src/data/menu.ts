export interface MenuItem {
  id: string;
  name: string;
  description: string;
  tag: string;
  category: string;
  price: number;
  image: string;
}

export const categories = ["Chef Picks", "Mains", "Sides", "Drinks", "Dessert"];

export const menuItems: MenuItem[] = [
  {
    id: "2",
    name: "Spicy Chicken Sandwich",
    description: "Crispy buttermilk chicken, sriracha mayo, pickled slaw",
    tag: "Popular",
    category: "Mains",
    price: 18,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
  },
  {
    id: "1",
    name: "Truffle Wagyu Burger",
    description: "A5 wagyu patty with black truffle aioli, aged gruyère, brioche",
    tag: "Chef's Pick",
    category: "Chef Picks",
    price: 34,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "3",
    name: "Lobster Bisque",
    description: "Creamy Maine lobster bisque with cognac cream and chive oil",
    tag: "Signature",
    category: "Chef Picks",
    price: 24,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
  },
  {
    id: "4",
    name: "Garden Risotto",
    description: "Arborio rice with seasonal vegetables and aged parmesan foam",
    tag: "Vegetarian",
    category: "Mains",
    price: 26,
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80",
  },
  {
    id: "5",
    name: "Charred Cauliflower Steak",
    description: "Whole roasted cauliflower with romesco, capers, and herb gremolata",
    tag: "Plant-Based",
    category: "Mains",
    price: 22,
    image: "https://images.unsplash.com/photo-1510627498534-cf7e9002facc?w=400&q=80",
  },
  {
    id: "6",
    name: "Pan-Seared Salmon",
    description: "Atlantic salmon with citrus beurre blanc and asparagus",
    tag: "Healthy",
    category: "Chef Picks",
    price: 42,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
  },
  {
    id: "7",
    name: "Rosemary Fries",
    description: "Hand-cut triple-fried potatoes with rosemary salt and truffle dip",
    tag: "Shareable",
    category: "Sides",
    price: 12,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
  },
  {
    id: "8",
    name: "Large Still Water",
    description: "Premium still mineral water, 750ml bottle",
    tag: "Refreshing",
    category: "Drinks",
    price: 6,
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
  },
  {
    id: "9",
    name: "Sparkling Water",
    description: "Fine sparkling mineral water with natural carbonation",
    tag: "Classic",
    category: "Drinks",
    price: 7,
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80",
  },
  {
    id: "10",
    name: "Mango Cooler",
    description: "Fresh mango purée, lime, sparkling water, and mint",
    tag: "Tropical",
    category: "Drinks",
    price: 9,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80",
  },
  {
    id: "11",
    name: "Iced Citrus Tea",
    description: "House-brewed black tea with orange, lemon, and raw honey",
    tag: "Fresh",
    category: "Drinks",
    price: 8,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
  },
  {
    id: "12",
    name: "Chocolate Soufflé",
    description: "Warm Valrhona chocolate soufflé with crème anglaise",
    tag: "Indulgent",
    category: "Dessert",
    price: 18,
    image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400&q=80",
  },
  {
    id: "13",
    name: "Vanilla Bean Panna Cotta",
    description: "Silky Tahitian vanilla custard with berry compote and pistachios",
    tag: "Classic",
    category: "Dessert",
    price: 15,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
  },
];
