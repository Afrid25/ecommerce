export interface Product {
  id: string | number;
  name: string;
  description: string;
  category: string;
  categorySlug?: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number;
  stock: number;
  image: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isHot?: boolean;
  isLimited?: boolean;
}
