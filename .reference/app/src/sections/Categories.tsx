import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useProductStore } from '@/store/productStore';

const Categories = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { categories } = useProductStore();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.3], [50, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={containerRef} className="py-20 bg-nike-gray-50 dark:bg-nike-dark overflow-hidden">
      <div className="container-nike">
        {/* Header */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-nike-black dark:text-white">
            Shop by Category
          </h2>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const rotations = [-5, 3, -2, 4];
            const initialY = index * -80;

            return (
              <motion.div
                key={category.id}
                initial={{ 
                  y: initialY, 
                  rotate: rotations[index],
                  opacity: 0 
                }}
                whileInView={{ 
                  y: 0, 
                  rotate: 0,
                  opacity: 1 
                }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  whileHover={{ y: -15, scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                >
                  <Link to={`/shop?category=${category.slug}`}>
                    {/* Image */}
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <motion.h3
                            className="font-display text-3xl text-white mb-1"
                          >
                            {category.name}
                          </motion.h3>
                          <p className="text-white/70 text-sm">
                            {category.productCount} Products
                          </p>
                        </div>
                        
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                          className="w-12 h-12 bg-nike-orange rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        </motion.div>
                      </div>

                      {/* Underline */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        className="h-0.5 bg-nike-orange mt-4 origin-left"
                      />
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
