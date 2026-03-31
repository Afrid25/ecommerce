import type { Product } from "@/types/product";

type ProductEnhancement = {
  material: string;
  materialBadges: string[];
  sustainabilityNote: string;
  artisanNote: string;
  gallery: string[];
  dimensions: string;
  care: string;
};

const enhancementMap: Record<string, ProductEnhancement> = {
  "Aurora Cane Lounge Chair": {
    material: "Cane",
    materialBadges: ["Cane Weave", "Ash Wood", "Low-VOC Finish"],
    sustainabilityNote:
      "Built with renewable cane weaving and sealed using a low-VOC matte finish for indoor comfort.",
    artisanNote:
      "The frame is shaped to highlight the grain rather than hide it, giving each chair a slightly unique character.",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200",
    ],
    dimensions: "W 28in x D 29in x H 31in",
    care: "Dust with a soft dry cloth. Avoid direct standing moisture on the cane weave.",
  },
  "Terracotta Ember Table Lamp": {
    material: "Terracotta",
    materialBadges: ["Terracotta Clay", "Linen Shade", "Hand-Finished"],
    sustainabilityNote:
      "Terracotta construction reduces reliance on synthetic finishes and brings natural thermal stability.",
    artisanNote:
      "The clay base is intentionally irregular, celebrating subtle handmade variation.",
    gallery: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1200",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    ],
    dimensions: "Shade 14in, Base Height 19in",
    care: "Wipe with a dry microfiber cloth. Use warm LED bulbs for the intended glow.",
  },
  "Bamboo Horizon Console": {
    material: "Bamboo",
    materialBadges: ["Pressed Bamboo", "Rounded Edges", "Natural Seal"],
    sustainabilityNote:
      "Bamboo matures quickly and offers a durable, renewable alternative to slower-growth hardwoods.",
    artisanNote:
      "The silhouette is designed to feel architectural while staying visually light in compact spaces.",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    ],
    dimensions: "W 48in x D 14in x H 31in",
    care: "Clean with a lightly damp cloth and dry immediately to preserve the matte finish.",
  },
  "Olive Grove Ceramic Vase": {
    material: "Ceramic",
    materialBadges: ["Stoneware", "Olive Glaze", "Studio Fired"],
    sustainabilityNote:
      "Made for long-term display and seasonal floral styling rather than fast decor turnover.",
    artisanNote:
      "The glaze pools differently on every vase, producing tonal depth and a soft handcrafted finish.",
    gallery: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200",
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1200",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200",
    ],
    dimensions: "H 14in x Dia 8in",
    care: "Hand wash gently and avoid abrasive scrubbers on the glazed surface.",
  },
};

function createDefaultEnhancement(product: Product): ProductEnhancement {
  const primaryMaterial =
    product.category === "Electronics"
      ? "Recycled Tech"
      : product.category === "Eco Lifestyle"
        ? "Bamboo"
        : product.category === "Accessories"
          ? "Cork"
          : product.category === "Cloths / Fashion"
            ? "Organic Cotton"
            : product.category === "Wooden Decor"
              ? "Ash Wood"
              : product.category === "Bamboo Products"
                ? "Bamboo"
                : product.category === "Lighting"
      ? "Terracotta"
      : product.category === "Storage"
        ? "Bamboo"
        : product.category === "Furniture"
          ? "Ash Wood"
          : "Natural Fibre";

  return {
    material: primaryMaterial,
    materialBadges: [primaryMaterial, "Sustainable Finish", "Crafted Detail"],
    sustainabilityNote:
      "Selected for durability, tactile finish, and a calmer material footprint than synthetic decor alternatives.",
    artisanNote:
      "Every piece is curated to feel restrained, warm, and grounded in natural texture.",
    gallery: [product.image, product.image, product.image],
    dimensions: "Available on request",
    care: "Use a soft cloth and avoid harsh cleaners to preserve the finish.",
  };
}

export function getProductEnhancement(product: Product): ProductEnhancement {
  const match = enhancementMap[product.name];

  if (!match) {
    return createDefaultEnhancement(product);
  }

  return match;
}

export function getMaterialForProduct(product: Product) {
  return getProductEnhancement(product).material;
}
