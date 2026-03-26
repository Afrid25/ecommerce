import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, User, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const navLinks = [
  { name: 'Shop', href: '/shop' },
  { name: 'Categories', href: '/shop' },
  { name: 'New Arrivals', href: '/shop?filter=new' },
  { name: 'Discounts', href: '/shop?filter=sale' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  
  const { getTotalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  const cartItemCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/90 dark:bg-nike-black/90 backdrop-blur-xl shadow-lg'
            : 'bg-transparent'
        }`}
        style={{ top: isScrolled ? 0 : '40px' }}
      >
        <div className="container-nike">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="block relative group"
              >
                <Link to="/">
                  <svg
                    className={`w-20 h-8 transition-all duration-300 ${
                      isScrolled ? 'text-nike-black dark:text-white' : 'text-white'
                    }`}
                    viewBox="0 0 100 35"
                    fill="currentColor"
                  >
                    <path d="M15 25C15 25 30 5 55 5C70 5 80 12 80 22C80 32 65 35 50 35C35 35 15 25 15 25Z" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.16, 1, 0.3, 1], 
                    delay: 0.4 + index * 0.08 
                  }}
                >
                  <Link
                    to={link.href}
                    className={`relative font-medium text-sm uppercase tracking-wider group ${
                      isScrolled 
                        ? 'text-nike-black dark:text-white' 
                        : 'text-white'
                    }`}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-nike-orange transition-all duration-300 group-hover:w-full group-hover:left-0" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55], delay: 0.7 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isScrolled 
                    ? 'text-nike-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Wishlist */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55], delay: 0.75 }}
                className={`hidden sm:block p-2 rounded-full transition-colors ${
                  isScrolled 
                    ? 'text-nike-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-5 h-5" />
              </motion.button>

              {/* User */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55], delay: 0.8 }}
              >
                {isAuthenticated ? (
                  <div className="relative group">
                    <button
                      className={`p-2 rounded-full transition-colors ${
                        isScrolled 
                          ? 'text-nike-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-nike-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-4">
                        <p className="font-medium text-nike-black dark:text-white">{user?.firstName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <hr className="border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className={`p-2 rounded-full transition-colors ${
                      isScrolled 
                        ? 'text-nike-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </motion.div>

              {/* Cart */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55], delay: 0.85 }}
                onClick={toggleCart}
                className={`relative p-2 rounded-full transition-colors ${
                  isScrolled 
                    ? 'text-nike-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartItemCount}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-nike-orange text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55], delay: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${
                  isScrolled 
                    ? 'text-nike-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-32"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4"
            >
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  autoFocus
                  className="w-full px-6 py-4 text-xl bg-white dark:bg-nike-black rounded-full shadow-2xl focus:outline-none focus:ring-2 focus:ring-nike-orange"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-nike-orange text-white rounded-full hover:bg-nike-orange/90 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-nike-black z-50 shadow-2xl lg:hidden"
          >
            <div className="p-6">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-nike-black dark:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <nav className="mt-12 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-display text-nike-black dark:text-white hover:text-nike-orange transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
