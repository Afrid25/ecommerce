import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const TrendingProducts = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products } = useProductStore();
  const { addItem, openCart } = useCartStore();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const titleX = useTransform(scrollYProgress, [0, 0.3], [-100, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleQuickAdd = (product: typeof products[0]) => {
    addItem(product, 1, product.sizes[0], product.colors[0]);
    toast.success(`${product.name} added to cart!`);
    openCart();
  };

  const trendingProducts = products.slice(0, 6);

  return (
    <section ref={containerRef} className="py-20 bg-white dark:bg-nike-black overflow-hidden">
      <div className="container-nike mb-12">
        <div className="flex items-end justify-between">
          <motion.div style={{ x: titleX, opacity: titleOpacity }}>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-nike-black dark:text-white mb-2">
              Trending Now
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              The hottest drops this week
            </p>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-1 w-24 bg-nike-orange mt-4 origin-left"
            />
          </motion.div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border-2 border-nike-black dark:border-white flex items-center justify-center hover:bg-nike-black hover:text-white dark:hover:bg-white dark:hover:text-nike-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border-2 border-nike-black dark:border-white flex items-center justify-center hover:bg-nike-black hover:text-white dark:hover:bg-white dark:hover:text-nike-black transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {trendingProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ y: 100, rotateY: -30, opacity: 0 }}
            whileInView={{ y: 0, rotateY: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.8,
              delay: index * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex-shrink-0 w-[300px] md:w-[350px] scroll-snap-align-start"
          >
            <div className="group relative bg-nike-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden">
              {/* Image */}
              <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
                <motion.img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                />
                
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickAdd(product);
                  }}
                  className="absolute bottom-4 left-4 right-4 py-3 bg-nike-orange text-white rounded-full font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                >
                  Quick Add
                </motion.button>

                {/* Badges */}
                {product.isNew && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-nike-orange text-white text-xs font-bold rounded-full">
                    NEW
                  </span>
                )}
                {product.isOnSale && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    SALE
                  </span>
                )}
              </Link>

              {/* Content */}
              <div className="p-5">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-display text-xl text-nike-black dark:text-white mb-1 group-hover:text-nike-orange transition-colors">
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
                  <span className="text-gray-400 text-sm">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl text-nike-black dark:text-white">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
