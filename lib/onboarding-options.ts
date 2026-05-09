import type { BrothPreference, DiningVibe, FlavorStyle, Gender, InterestedIn } from "./types";

export const STYLE_OPTIONS: {
  value: FlavorStyle;
  label: string;
  emoji: string;
  subtitle: string;
}[] = [
  { value: "dry", label: "Dry pot", emoji: "🥘", subtitle: "Stir-fried, crispy bits" },
  { value: "soup", label: "Soup", emoji: "🍲", subtitle: "Bubbling, drinkable broth" },
  { value: "both", label: "Both", emoji: "🌶️", subtitle: "Why pick just one" },
];

export const SPICE_LEVELS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: "Mild" },
  { value: 2, label: "Light" },
  { value: 3, label: "Medium" },
  { value: 4, label: "Hot" },
  { value: 5, label: "Insane" },
];

export const INGREDIENT_GROUPS: { key: string; label: string; emoji: string; items: string[] }[] = [
  {
    key: "carbs",
    label: "Carbs & Noodles",
    emoji: "🍜",
    items: [
      "sweet potato glass noodles",
      "instant noodles",
      "wide hor fun",
      "kway teow",
      "udon",
      "vermicelli",
    ],
  },
  {
    key: "leafyVeg",
    label: "Leafy Veg",
    emoji: "🥬",
    items: ["bok choy", "xiao bai cai", "kangkong", "chinese cabbage", "coriander"],
  },
  {
    key: "rootVeg",
    label: "Root Veg & Crunch",
    emoji: "🥕",
    items: ["lotus root", "potato slices", "sweet corn", "cauliflower", "winter melon"],
  },
  {
    key: "mushroom",
    label: "Mushrooms",
    emoji: "🍄",
    items: ["enoki mushrooms", "king oyster mushrooms", "shiitake mushrooms", "wood ear fungus"],
  },
  {
    key: "tofu",
    label: "Tofu & Beancurd",
    emoji: "🍢",
    items: ["tofu puffs", "tau pok", "beancurd skin", "egg tofu", "firm tofu"],
  },
  {
    key: "meat",
    label: "Meat",
    emoji: "🥩",
    items: ["pork belly", "beef slices", "chicken", "luncheon meat", "lamb slices"],
  },
  {
    key: "offal",
    label: "Bold Picks",
    emoji: "🔥",
    items: ["beef tripe", "pork intestine", "duck blood", "chicken gizzard"],
  },
  {
    key: "seafood",
    label: "Seafood",
    emoji: "🦐",
    items: ["prawns", "squid", "fish slices", "fish cake", "quail eggs"],
  },
  {
    key: "balls",
    label: "Balls & Rolls",
    emoji: "🥟",
    items: [
      "fish balls",
      "beef balls",
      "cheese tofu",
      "cheese rice cake",
      "fried beancurd skin rolls",
    ],
  },
];

export const BROTH_OPTIONS: {
  value: BrothPreference;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { value: "mala", label: "Mala", desc: "Numbing + spicy", emoji: "🌶️" },
  { value: "tomato", label: "Tomato", desc: "Sweet + tangy", emoji: "🍅" },
  { value: "mushroom", label: "Mushroom", desc: "Earthy + mild", emoji: "🍄" },
  { value: "split", label: "Split pot", desc: "Best of both", emoji: "🥄" },
];

export const VIBE_OPTIONS: { value: DiningVibe; label: string; desc: string; emoji: string }[] = [
  { value: "loud-group", label: "Loud group", desc: "More the merrier", emoji: "🎉" },
  { value: "intimate-booth", label: "Intimate booth", desc: "Quiet two-tops", emoji: "🕯️" },
  { value: "casual", label: "Casual hawker", desc: "Plastic stools, real talk", emoji: "🪑" },
];

export const GENDER_OPTIONS: { value: Gender; label: string; emoji: string }[] = [
  { value: "woman", label: "Woman", emoji: "♀️" },
  { value: "man", label: "Man", emoji: "♂️" },
  { value: "nonbinary", label: "Non-binary", emoji: "⚧️" },
];

export const INTERESTED_IN_OPTIONS: {
  value: InterestedIn;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { value: "women", label: "Women", emoji: "♀️", desc: "Show me women only" },
  { value: "men", label: "Men", emoji: "♂️", desc: "Show me men only" },
  { value: "everyone", label: "Everyone", emoji: "🌍", desc: "Open to all" },
];
