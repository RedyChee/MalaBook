// lib/flavor.js — Flavor vector encoder for MalaBook
// 14-dim vector: 4 behavioral + 1 broth + 9 ingredient-category dims

const INGREDIENT_CATEGORIES = {
  carbs: [
    "sweet potato glass noodles", "instant noodles", "wide hor fun",
    "kway teow", "udon", "mee pok", "fresh egg noodles", "rice cakes",
    "nian gao", "tteokbokki", "korean rice cakes", "vermicelli", "mee hoon"
  ],
  leafyVeg: [
    "chinese cabbage", "cabbage", "bok choy", "xiao bai cai",
    "shanghai greens", "kangkong", "water spinach", "spinach",
    "coriander", "celery", "chinese celery"
  ],
  rootVeg: [
    "lotus root", "potato", "potato slices", "sweet potato", "yam", "taro",
    "bamboo shoots", "carrot", "winter melon", "cauliflower", "broccoli",
    "corn", "sweet corn", "baby corn"
  ],
  mushroom: [
    "enoki mushrooms", "enoki", "king oyster mushrooms", "king oyster",
    "shiitake mushrooms", "shiitake", "shimeji", "white beech mushrooms",
    "wood ear fungus", "black fungus", "snow fungus", "white fungus"
  ],
  tofu: [
    "firm tofu", "tofu cubes", "tofu puffs", "tau pok",
    "beancurd skin", "fu zhu", "fresh beancurd sheets", "fu pi", "egg tofu"
  ],
  meat: [
    "pork belly", "pork belly slices", "beef", "beef slices", "chicken",
    "chicken breast", "chicken thigh", "chicken wings", "lamb", "lamb slices",
    "luncheon meat", "spam", "taiwanese sausage", "lap cheong",
    "pork meatballs", "beef meatballs"
  ],
  offal: [
    "chicken gizzard", "beef tripe", "pork intestine", "duck blood", "pork liver"
  ],
  seafood: [
    "prawns", "squid", "sotong", "fish slices", "fish cake", "crayfish",
    "clams", "mussels", "quail eggs"
  ],
  balls: [
    "fish balls", "beef balls", "cuttlefish balls", "lobster balls",
    "cheese tofu", "cheese rice cake", "crab sticks", "imitation crab",
    "fried beancurd skin rolls", "fried beancurd rolls"
  ]
};

// normalize for matching (lowercase, trim)
const norm = s => s.toLowerCase().trim();
const CATEGORY_SETS = Object.fromEntries(
  Object.entries(INGREDIENT_CATEGORIES).map(([k, v]) => [k, new Set(v.map(norm))])
);

function categoryScore(picks, categoryKey, target = 2) {
  const set = CATEGORY_SETS[categoryKey];
  const count = picks.filter(p => set.has(norm(p))).length;
  return Math.min(1.0, count / target);
}

function encodeProfile(p) {
  const picks = p.topIngredients || [];

  // Behavioral
  const dryAffinity = p.style === "dry" ? 0.9 : p.style === "both" ? 0.5 : 0.15;
  const soupAffinity = p.style === "soup" ? 0.9 : p.style === "both" ? 0.5 : 0.15;
  const spiceLevel = (p.spiceLevel || 1) / 5;
  const socialVibe = p.vibe === "loud-group" ? 1.0 : p.vibe === "casual" ? 0.5 : 0.1;

  // Broth
  const numbingLove =
    p.brothPreference === "mala" ? 0.9 :
    p.brothPreference === "split" ? 0.55 :
    p.brothPreference === "tomato" ? 0.15 :
    p.brothPreference === "mushroom" ? 0.25 : 0.3;

  // Ingredient categories
  const carbLove = categoryScore(picks, "carbs");
  const leafyVeg = categoryScore(picks, "leafyVeg");
  const rootVeg = categoryScore(picks, "rootVeg");
  const mushroomLove = categoryScore(picks, "mushroom");
  const tofuLove = categoryScore(picks, "tofu");
  const meatLove = categoryScore(picks, "meat");
  const offalAdventurous = categoryScore(picks, "offal", 1); // even 1 offal pick = bold
  const seafoodLove = categoryScore(picks, "seafood");
  const ballsAndRolls = categoryScore(picks, "balls");

  return [
    dryAffinity, soupAffinity, spiceLevel, socialVibe,
    numbingLove,
    carbLove, leafyVeg, rootVeg, mushroomLove, tofuLove,
    meatLove, offalAdventurous, seafoodLove, ballsAndRolls
  ];
}

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function findTopMatches(user, allUsers, k = 3) {
  return allUsers
    .filter(o => o.id !== user.id)
    .map(o => ({ user: o, score: cosineSimilarity(user.flavorVector, o.flavorVector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

module.exports = {
  encodeProfile, cosineSimilarity, findTopMatches,
  INGREDIENT_CATEGORIES, CATEGORY_SETS,
  VECTOR_DIMS: [
    "dryAffinity", "soupAffinity", "spiceLevel", "socialVibe",
    "numbingLove",
    "carbLove", "leafyVeg", "rootVeg", "mushroomLove", "tofuLove",
    "meatLove", "offalAdventurous", "seafoodLove", "ballsAndRolls"
  ]
};
