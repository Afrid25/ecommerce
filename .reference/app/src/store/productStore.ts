import { create } from 'zustand';
import type { Product, Category, FilterState, Offer, Testimonial } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  offers: Offer[];
  testimonials: Testimonial[];
  filteredProducts: Product[];
  filters: FilterState;
  isLoading: boolean;
  selectedProduct: Product | null;
  
  // Actions
  setFilters: (filters: Partial<FilterState>) => void;
  applyFilters: () => void;
  selectProduct: (product: Product | null) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getBestsellers: () => Product[];
  getNewArrivals: () => Product[];
  getOnSale: () => Product[];
  searchProducts: (query: string) => Product[];
}

// Mock Products Data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Air Max Pulse',
    description: 'Designed for the bold, built for the streets. Experience unmatched comfort with revolutionary Air cushioning technology.',
    price: 159.99,
    images: ['/images/products/air-max-pulse-1.jpg', '/images/products/air-max-pulse-2.jpg'],
    category: 'lifestyle',
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    colors: ['Black', 'White', 'Orange'],
    rating: 4.8,
    reviewCount: 245,
    stock: 50,
    isNew: true,
    isBestseller: true,
    tags: ['air max', 'lifestyle', 'comfort'],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Air Force 1 \'07',
    description: 'The radiance lives on in the Nike Air Force 1 \'07, the basketball original that puts a fresh spin on what you know best.',
    price: 110.00,
    images: ['/images/products/air-force-1-1.jpg', '/images/products/air-force-1-2.jpg'],
    category: 'lifestyle',
    sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '11', '12', '13'],
    colors: ['White', 'Black'],
    rating: 4.9,
    reviewCount: 892,
    stock: 120,
    isBestseller: true,
    tags: ['classic', 'basketball', 'icon'],
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Dunk Low Retro',
    description: 'Created for the hardwood but taken to the streets, the Nike Dunk Low Retro returns with crisp overlays and original team colors.',
    price: 115.00,
    images: ['/images/products/dunk-low-1.jpg', '/images/products/dunk-low-2.jpg'],
    category: 'lifestyle',
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'],
    colors: ['Syracuse', 'Kentucky', 'Panda'],
    rating: 4.7,
    reviewCount: 567,
    stock: 30,
    isNew: true,
    tags: ['retro', 'skate', 'classic'],
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'Air Jordan 1 Mid',
    description: 'Inspired by the original AJ1, this mid-top edition maintains the iconic look you love while fresh color choices give it a unique identity.',
    price: 125.00,
    images: ['/images/products/jordan-1-mid-1.jpg', '/images/products/jordan-1-mid-2.jpg'],
    category: 'basketball',
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13'],
    colors: ['Chicago', 'Bred', 'Royal'],
    rating: 4.9,
    reviewCount: 723,
    stock: 45,
    isBestseller: true,
    tags: ['jordan', 'basketball', 'icon'],
    createdAt: '2024-01-20',
  },
  {
    id: '5',
    name: 'Pegasus 40',
    description: 'The Nike Pegasus 40 is designed for comfort at every mile. Experience responsive cushioning and breathable support.',
    price: 130.00,
    originalPrice: 140.00,
    images: ['/images/products/pegasus-40-1.jpg', '/images/products/pegasus-40-2.jpg'],
    category: 'running',
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13', '14'],
    colors: ['Black', 'White', 'Blue'],
    rating: 4.6,
    reviewCount: 334,
    stock: 80,
    isOnSale: true,
    discount: 7,
    tags: ['running', 'daily', 'comfort'],
    createdAt: '2024-01-05',
  },
  {
    id: '6',
    name: 'Metcon 9',
    description: 'The Nike Metcon 9 is built for your toughest workouts. Stable, durable, and ready for anything you throw at it.',
    price: 150.00,
    images: ['/images/products/metcon-9-1.jpg', '/images/products/metcon-9-2.jpg'],
    category: 'training',
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    colors: ['Black', 'Gray', 'Red'],
    rating: 4.7,
    reviewCount: 189,
    stock: 60,
    tags: ['training', 'gym', 'crossfit'],
    createdAt: '2024-01-25',
  },
  {
    id: '7',
    name: 'LeBron XXI',
    description: 'Built for the king. The LeBron XXI delivers explosive power and precision control for players who demand excellence.',
    price: 200.00,
    images: ['/images/products/lebron-21-1.jpg', '/images/products/lebron-21-2.jpg'],
    category: 'basketball',
    sizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
    colors: ['Crown Jewel', 'Akoya', 'Melon Tint'],
    rating: 4.8,
    reviewCount: 156,
    stock: 25,
    isNew: true,
    tags: ['lebron', 'basketball', 'elite'],
    createdAt: '2024-02-10',
  },
  {
    id: '8',
    name: 'Vaporfly 3',
    description: 'The Nike Vaporfly 3 is built for speed. Propulsive cushioning and lightweight design help you chase your personal best.',
    price: 260.00,
    originalPrice: 290.00,
    images: ['/images/products/vaporfly-3-1.jpg', '/images/products/vaporfly-3-2.jpg'],
    category: 'running',
    sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    colors: ['Electric', 'Proto', 'ZoomX'],
    rating: 4.9,
    reviewCount: 278,
    stock: 40,
    isOnSale: true,
    discount: 10,
    tags: ['running', 'racing', 'carbon plate'],
    createdAt: '2024-01-08',
  },
];

// Mock Categories
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Running',
    slug: 'running',
    image: '/images/categories/running.jpg',
    productCount: 45,
  },
  {
    id: '2',
    name: 'Basketball',
    slug: 'basketball',
    image: '/images/categories/basketball.jpg',
    productCount: 32,
  },
  {
    id: '3',
    name: 'Lifestyle',
    slug: 'lifestyle',
    image: '/images/categories/lifestyle.jpg',
    productCount: 68,
  },
  {
    id: '4',
    name: 'Training',
    slug: 'training',
    image: '/images/categories/training.jpg',
    productCount: 28,
  },
];

// Mock Offers
const mockOffers: Offer[] = [
  {
    id: '1',
    title: 'Summer Sale',
    description: 'Get up to 50% off on selected items',
    discountType: 'percentage',
    discountValue: 50,
    code: 'SUMMER50',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    isActive: true,
    minOrderAmount: 100,
    usedCount: 342,
  },
  {
    id: '2',
    title: 'New Member',
    description: '15% off your first order',
    discountType: 'percentage',
    discountValue: 15,
    code: 'WELCOME15',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    usedCount: 128,
  },
];

// Mock Testimonials
const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    avatar: '/images/avatars/marcus.jpg',
    role: 'Professional Runner',
    content: 'The Vaporfly 3 changed my race day performance. Best investment for serious runners.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: '/images/avatars/sarah.jpg',
    role: 'Fitness Trainer',
    content: 'My clients love the Metcon series. Durable, stable, and perfect for any workout.',
    rating: 5,
  },
  {
    id: '3',
    name: 'David Williams',
    avatar: '/images/avatars/david.jpg',
    role: 'Basketball Coach',
    content: 'The LeBron line delivers elite performance. My players swear by them.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    avatar: '/images/avatars/emily.jpg',
    role: 'Streetwear Enthusiast',
    content: 'Air Force 1s are timeless. The quality and style never disappoint.',
    rating: 5,
  },
  {
    id: '5',
    name: 'James Park',
    avatar: '/images/avatars/james.jpg',
    role: 'Marathon Runner',
    content: 'Pegasus 40 is my daily trainer. Comfortable for long miles and recovery runs.',
    rating: 4,
  },
  {
    id: '6',
    name: 'Aisha Thompson',
    avatar: '/images/avatars/aisha.jpg',
    role: 'Sneaker Collector',
    content: 'The Dunk Low Retro quality is exceptional. A must-have for any collection.',
    rating: 5,
  },
];

const defaultFilters: FilterState = {
  categories: [],
  priceRange: [0, 500],
  sizes: [],
  colors: [],
  rating: 0,
  sortBy: 'popular',
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  categories: mockCategories,
  offers: mockOffers,
  testimonials: mockTestimonials,
  filteredProducts: mockProducts,
  filters: defaultFilters,
  isLoading: false,
  selectedProduct: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { products, filters } = get();
    let result = [...products];

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => filters.sizes.includes(s))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => filters.colors.includes(c))
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter((p) => p.rating >= filters.rating);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Popular - by review count
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    set({ filteredProducts: result });
  },

  selectProduct: (product) => set({ selectedProduct: product }),

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },

  getProductsByCategory: (category) => {
    return get().products.filter((p) => p.category === category);
  },

  getBestsellers: () => {
    return get().products.filter((p) => p.isBestseller);
  },

  getNewArrivals: () => {
    return get().products.filter((p) => p.isNew);
  },

  getOnSale: () => {
    return get().products.filter((p) => p.isOnSale);
  },

  searchProducts: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  },
}));
