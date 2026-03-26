import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const OfferSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          src="/images/categories/lifestyle.jpg"
          alt="Summer Sale"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-nike-black/90 via-nike-black/70 to-transparent" />
      </div>

      {/* Diagonal Divider */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full bg-nike-orange hidden lg:block"
        style={{
          clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-nike h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full py-20">
          {/* Left Content */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-nike-orange text-white rounded-full text-sm font-bold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Limited Time Offer
            </motion.div>

            {/* Title */}
            <h2 className="font-display text-6xl md:text-7xl lg:text-8xl text-white mb-2">
              Summer
            </h2>
            <h2 className="font-display text-6xl md:text-7xl lg:text-8xl text-nike-orange mb-6">
              Sale
            </h2>

            <p className="text-white/80 text-xl mb-4">
              Up to <span className="text-nike-orange font-bold text-3xl">50% Off</span>
            </p>

            <p className="text-white/60 text-lg mb-8 max-w-md">
              Grab your favorites before they're gone. Limited stock available on selected items.
            </p>

            {/* Countdown */}
            <div className="flex gap-4 mb-8">
              {timeBlocks.map((block, index) => (
                <motion.div
                  key={block.label}
                  initial={{ rotateX: -90, opacity: 0 }}
                  whileInView={{ rotateX: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2">
                    <motion.span
                      key={block.value}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="font-display text-2xl md:text-3xl text-white"
                    >
                      {String(block.value).padStart(2, '0')}
                    </motion.span>
                  </div>
                  <span className="text-white/60 text-xs uppercase tracking-wider">
                    {block.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Link
                to="/shop?filter=sale"
                className="inline-flex items-center gap-2 bg-nike-orange text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-nike-lg transition-all duration-300 group"
              >
                Shop the Sale
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content (Empty for diagonal effect) */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
