import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const TopBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
        animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
        exit={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-nike-orange text-white relative overflow-hidden"
      >
        <div className="container-nike py-3">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span className="font-medium">
              Sign up for our newsletter and get 15% off your next order
            </span>
            <motion.a
              href="#"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }}
              className="underline font-semibold hover:text-nike-black transition-colors relative group"
            >
              Claim Offer
              <span className="absolute -inset-1 bg-white/20 rounded blur-md opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
            </motion.a>
          </motion.div>
        </div>
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default TopBar;
