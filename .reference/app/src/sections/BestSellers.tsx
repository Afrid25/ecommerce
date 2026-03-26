import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const BestSellers = () => {
  const { getBestsellers } = useProductStore();
  const { addItem, openCart } = useCartStore();
  const bestsellers = getBestsellers();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const handleQuickAdd = (product: typeof bestsellers[0]) => {
    addItem(product, 1, product.sizes[0], product.colors[0]);
    toast.success(`${product.name} added to cart!`);
    openCart();
  };

  return (
    <section className="py-20 bg-white dark:bg-nike-black">
      <div className="container-nike">
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-nike-black dark:text-white mb-2">
            Best Sellers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Fan favorites flying off the shelves
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {bestsellers.map((product, index) => {
            const isLarge = index === 1 || index === 4;
            
            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className={`${isLarge ? 'sm:row-span-2' : ''}`}
              >
                <div className="group relative bg-nike-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden h-full">
                  {/* Image */}
                  <Link 
                    to={`/product/${product.id}`} 
                    className={`block relative overflow-hidden ${isLarge ? 'aspect-[3/4]' : 'aspect-square'}`}
                  >
                    <motion.div
                      initial={{ clipPath: 'inset(100% 0 0 0)' }}
                      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="w-full h-full"
                    >
                      <motion.img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      />
                    </motion.div>

                    {/* Bestseller Badge */}
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute top-4 left-4 px-3 py-1 bg-nike-orange text-white text-xs font-bold rounded-full"
                    >
                      BESTSELLER
                    </motion.span>

                    {/* Actions */}
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
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuickAdd(product);
                      }}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-nike-orange text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ShoppingCart className="w-5 h-5" />
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
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-nike-orange fill-nike-orange'
                                  : 'text-gray-300'
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <span className="font-display text-2xl text-nike-black dark:text-white">
                      ${product.price}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default BestSellers;
