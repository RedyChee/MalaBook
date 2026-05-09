export type FlavorStyle = "dry" | "soup" | "both";
export type SpiceLevel = 1 | 2 | 3 | 4 | 5;
export type BrothPreference = "mala" | "tomato" | "mushroom" | "split";
export type DiningVibe = "loud-group" | "intimate-booth" | "casual";
export type Gender = "woman" | "man" | "nonbinary";
export type InterestedIn = "women" | "men" | "everyone";

export type FlavorProfile = {
  style: FlavorStyle;
  spiceLevel: SpiceLevel;
  topIngredients: string[];
  brothPreference: BrothPreference;
  vibe: DiningVibe;
};

export type User = {
  id: string;
  name: string;
  age: number;
  bio: string;
  flavorProfile: FlavorProfile;
  avatar: string;
  flavorVector: number[];
  gender: Gender;
  interestedIn: InterestedIn;
};

export type Restaurant = {
  id: string;
  name: string;
  nameZh: string;
  neighborhood: string;
  style: FlavorStyle;
  spiceRange: [number, number];
  signature: string[];
  vibe: string;
  priceRange: "$" | "$$" | "$$$";
  notes?: string;
};

export type Match = {
  user: User;
  score: number;
};
