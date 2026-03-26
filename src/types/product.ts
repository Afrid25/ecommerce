export interface Product {
  id: string | number;
  name: string;
  description: string;
  category: string;
  categorySlug?: string;
  price: number;
  stock: number;
  image: string;
}
