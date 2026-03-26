import { motion } from 'framer-motion';
import { Truck, ShoppingBag, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free shipping on all orders over $150. Express delivery available.',
  },
  {
    icon: ShoppingBag,
    title: 'Easy Returns',
    description: '30-day hassle-free returns. No questions asked, full refunds.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: '256-bit SSL encryption. Your data is always protected.',
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 80, rotateX: 15, opacity: 0 },
    visible: {
      y: 0,
      rotateX: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: [0.68, -0.55, 0.265, 1.55] as const,
      },
    },
  };

  return (
    <section className="py-20 bg-white dark:bg-nike-black">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="container-nike"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              custom={index}
              className="group relative"
              style={{ 
                marginTop: index === 1 ? '40px' : index === 2 ? '-20px' : '0',
              }}
            >
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-nike-gray-50 dark:bg-white/5 rounded-2xl p-8 h-full hover:shadow-xl transition-shadow duration-300"
              >
                {/* Icon */}
                <motion.div
                  variants={iconVariants}
                  className="w-16 h-16 bg-nike-orange/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-nike-orange/20 transition-colors"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-nike-orange" />
                  </motion.div>
                </motion.div>

                {/* Content */}
                <h3 className="font-display text-2xl text-nike-black dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Connector Lines (Desktop) */}
        <svg
          className="hidden lg:block absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 pointer-events-none"
          style={{ opacity: 0.2 }}
        >
          <motion.line
            x1="25%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="#FF6A00"
            strokeWidth="2"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8 }}
          />
          <motion.line
            x1="50%"
            y1="50%"
            x2="75%"
            y2="50%"
            stroke="#FF6A00"
            strokeWidth="2"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
          />
        </svg>
      </motion.div>
    </section>
  );
};

export default Features;
