import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid3X3, LayoutList } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = ['Running', 'Basketball', 'Lifestyle', 'Training'];
const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'];
const colors = ['Black', 'White', 'Orange', 'Red', 'Blue', 'Gray'];

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const { filteredProducts, filters, setFilters } = useProductStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Parse URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const filterParam = searchParams.get('filter');
    const searchQuery = searchParams.get('search');

    if (categoryParam) {
      setFilters({ categories: [categoryParam] });
    } else if (filterParam === 'new') {
      setFilters({ sortBy: 'newest' });
    } else if (filterParam === 'sale') {
      // Filter for sale items
    } else if (filterParam === 'bestsellers') {
      setFilters({ sortBy: 'popular' });
    } else if (searchQuery) {
      // Handle search
    }
  }, [searchParams, setFilters]);

  const handlePriceChange = (value: number[]) => {
    setFilters({ priceRange: [value[0], value[1]] });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category.toLowerCase())
      ? filters.categories.filter((c) => c !== category.toLowerCase())
      : [...filters.categories, category.toLowerCase()];
    setFilters({ categories: newCategories });
  };

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    setFilters({ sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    setFilters({ colors: newColors });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 500],
      sizes: [],
      colors: [],
      rating: 0,
      sortBy: 'popular',
    });
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h4 className="font-display text-lg mb-4">Price Range</h4>
        <Slider
          defaultValue={[0, 500]}
          max={500}
          step={10}
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-display text-lg mb-4">Categories</h4>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-3">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category.toLowerCase())}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={`category-${category}`} className="cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-display text-lg mb-4">Sizes</h4>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <motion.button
              key={size}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSize(size)}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.sizes.includes(size)
                  ? 'bg-nike-orange text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-display text-lg mb-4">Colors</h4>
        <div className="space-y-3">
          {colors.map((color) => (
            <div key={color} className="flex items-center gap-3">
              <Checkbox
                id={`color-${color}`}
                checked={filters.colors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
              />
              <Label htmlFor={`color-${color}`} className="cursor-pointer flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                {color}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-nike-black pt-32 pb-20"
    >
      <div className="container-nike">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-5xl md:text-6xl text-nike-black dark:text-white mb-2">
              Shop All
            </h1>
            <p className="text-gray-500">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ sortBy: value as typeof filters.sortBy })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-nike-orange text-white' : ''}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-nike-orange text-white' : ''}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-nike-orange hover:underline"
                >
                  Clear all
                </button>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <motion.div
              layout
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopPage;
