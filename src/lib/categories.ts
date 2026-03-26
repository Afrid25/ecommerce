export type CategoryDefinition = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
};

export const categoryDefinitions: CategoryDefinition[] = [
  {
    id: 1,
    name: "Bamboo Products",
    slug: "bamboo-products",
    image: "/images/matverse/product_bamboo_cutlery.jpg",
    description: "Renewable bamboo essentials for dining, storage, and calmer daily rituals.",
  },
  {
    id: 2,
    name: "Wooden Decor",
    slug: "wooden-decor",
    image: "/images/matverse/product_oak_shelf.jpg",
    description: "Warm wood silhouettes and sculptural accents designed to add depth and character.",
  },
  {
    id: 3,
    name: "Eco Lifestyle",
    slug: "eco-lifestyle",
    image: "/images/matverse/interior_scene_collage.jpg",
    description: "Low-waste home upgrades that blend utility, comfort, and sustainable materials.",
  },
  {
    id: 4,
    name: "Handmade Crafts",
    slug: "handmade-crafts",
    image: "/images/matverse/product_woven_basket.jpg",
    description: "Small-batch woven, carved, and hand-finished pieces made to feel personal and premium.",
  },
  {
    id: 5,
    name: "Cloths / Fashion",
    slug: "cloths-fashion",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=80",
    description: "Soft textures, conscious fabrics, and wearable essentials grounded in natural tones.",
  },
  {
    id: 6,
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&auto=format&fit=crop&q=80",
    description: "Giftable details, daily carry pieces, and finishing touches with tactile charm.",
  },
  {
    id: 7,
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    description: "Thoughtfully selected tech with a cleaner footprint and a design-forward look.",
  },
];

const legacyCategoryMap: Record<string, string> = {
  Bamboo: "bamboo-products",
  BambooProducts: "bamboo-products",
  Decor: "wooden-decor",
  Furniture: "wooden-decor",
  Wooden: "wooden-decor",
  WoodenDecor: "wooden-decor",
  Lighting: "eco-lifestyle",
  Rituals: "eco-lifestyle",
  Lifestyle: "eco-lifestyle",
  Storage: "handmade-crafts",
  Crafts: "handmade-crafts",
  Handmade: "handmade-crafts",
  Textiles: "cloths-fashion",
  Fashion: "cloths-fashion",
  Cloths: "cloths-fashion",
  Accessories: "accessories",
  Dining: "accessories",
  Electronics: "electronics",
};

export function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveCategorySlug(value?: string | null) {
  if (!value) {
    return categoryDefinitions[0].slug;
  }

  const normalized = value.trim();
  const matchedLegacy = legacyCategoryMap[normalized.replace(/\s+/g, "")] ?? legacyCategoryMap[normalized];
  const slugCandidate = matchedLegacy ?? slugifyCategory(normalized);
  const category = categoryDefinitions.find((entry) => entry.slug === slugCandidate);

  return category?.slug ?? categoryDefinitions[0].slug;
}

export function getCategoryBySlug(slug?: string | null) {
  return categoryDefinitions.find((category) => category.slug === slug);
}

export function getCategoryByName(name?: string | null) {
  return categoryDefinitions.find((category) => category.name === name);
}

export function getCategoryName(slug?: string | null) {
  return getCategoryBySlug(resolveCategorySlug(slug))?.name ?? categoryDefinitions[0].name;
}
