import { motion } from 'framer-motion';
import Hero from '@/sections/Hero';
import Features from '@/sections/Features';
import TrendingProducts from '@/sections/TrendingProducts';
import Categories from '@/sections/Categories';
import BestSellers from '@/sections/BestSellers';
import Testimonials from '@/sections/Testimonials';
import OfferSection from '@/sections/OfferSection';

const HomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <Features />
      <TrendingProducts />
      <Categories />
      <BestSellers />
      <OfferSection />
      <Testimonials />
    </motion.div>
  );
};

export default HomePage;
