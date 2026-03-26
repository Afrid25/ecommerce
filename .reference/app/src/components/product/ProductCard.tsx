import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
  const { addItem, openCart } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.sizes[0], product.colors[0]);
    toast.success(`${product.name} added to cart!`);
    openCart();
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="group bg-nike-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden"
      >
        <Link to={`/product/${product.id}`} className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
            {product.isNew && (
              <span className="absolute top-3 left-3 px-2 py-1 bg-nike-orange text-white text-xs font-bold rounded-full">
                NEW
              </span>
            )}
            {product.isOnSale && (
              <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                SALE
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl text-nike-black dark:text-white mb-2 group-hover:text-nike-orange transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-nike-orange fill-nike-orange" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                {product.description}
              </p>
              <div className="flex gap-2">
                {product.sizes.slice(0, 4).map((size) => (
                  <span
                    key={size}
                    className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs"
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 4 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{product.sizes.length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
              <div className="text-right">
                <span className="font-display text-2xl text-nike-black dark:text-white">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-gray-400 line-through ml-2">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuickAdd}
                  className="px-4 py-2 bg-nike-orange text-white rounded-full font-semibold flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="group bg-nike-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <motion.img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-nike-orange text-white text-xs font-bold rounded-full">
              NEW
            </span>
          )}
          {product.isOnSale && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              SALE
            </span>
          )}
          {product.isBestseller && (
            <span className="px-3 py-1 bg-nike-black text-white text-xs font-bold rounded-full">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick Add */}
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleQuickAdd}
          className="absolute bottom-4 left-4 right-4 py-3 bg-nike-orange text-white rounded-full font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
        >
          Quick Add
        </motion.button>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-xl text-nike-black dark:text-white mb-2 group-hover:text-nike-orange transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-nike-orange fill-nike-orange" />
            <span className="text-sm font-medium text-nike-black dark:text-white">
              {product.rating}
            </span>
          </div>
          <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display text-2xl text-nike-black dark:text-white">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through">${product.originalPrice}</span>
          )}
          {product.discount && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
              -{product.discount}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
