import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ['0%', '-20%']);

  useEffect(() => {
    // GSAP character animation for title
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.char');
      gsap.fromTo(
        chars,
        { y: '100%', rotateX: -90, opacity: 0 },
        {
          y: '0%',
          rotateX: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.03,
          ease: 'power4.out',
          delay: 1,
        }
      );
    }
  }, []);

  const titleLine1 = 'Nike Air';
  const titleLine2 = 'Max Pulse';

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 w-full h-[120%]"
      >
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
        >
          <img
            src="/images/hero-bg.jpg"
            alt="Nike Air Max Pulse"
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex items-center"
      >
        <div className="container-nike">
          <div className="max-w-2xl">
            {/* Subtitle */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
              className="flex items-center gap-2 mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Star className="w-5 h-5 text-nike-orange fill-nike-orange" />
              </motion.div>
              <span className="text-white/90 text-sm font-medium uppercase tracking-wider">
                #1 Best Seller
              </span>
            </motion.div>

            {/* Title */}
            <h1 ref={titleRef} className="mb-6 perspective-1000">
              <div className="overflow-hidden">
                <span className="font-display text-7xl md:text-8xl lg:text-9xl text-white block">
                  {titleLine1.split('').map((char, i) => (
                    <span
                      key={i}
                      className="char inline-block"
                      style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="font-display text-7xl md:text-8xl lg:text-9xl text-nike-orange block">
                  {titleLine2.split('').map((char, i) => (
                    <span
                      key={i}
                      className="char inline-block"
                      style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
              </div>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.6 }}
              className="text-white/80 text-lg md:text-xl mb-10 max-w-lg leading-relaxed"
            >
              Designed for the bold, built for the streets. Experience unmatched
              comfort with revolutionary Air cushioning technology.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 1.8 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-nike-orange text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-nike-lg transition-all duration-300 group"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/product/1"
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-nike-black transition-all duration-300"
                >
                  Explore
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Diagonal Divider */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-white dark:bg-nike-black"
        style={{
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)',
        }}
      />
    </section>
  );
};

export default Hero;
