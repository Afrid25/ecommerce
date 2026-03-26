import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const CartDrawer = () => {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    clearCart 
  } = useCartStore();

  const total = getTotalPrice();

  const handleRemove = (productId: string, size: string, color: string, name: string) => {
    removeItem(productId, size, color);
    toast.success(`${name} removed from cart`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-nike-black z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-nike-orange" />
                <h2 className="font-display text-2xl text-nike-black dark:text-white">
                  Your Cart
                </h2>
                <span className="px-2 py-1 bg-nike-orange/10 text-nike-orange text-sm font-bold rounded-full">
                  {items.length}
                </span>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
                  >
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </motion.div>
                  <h3 className="font-display text-xl text-nike-black dark:text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Looks like you haven't added anything yet.
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="px-6 py-3 bg-nike-orange text-white rounded-full font-semibold hover:shadow-nike transition-shadow"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 50, opacity: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 bg-gray-50 dark:bg-white/5 rounded-xl p-4"
                    >
                      {/* Image */}
                      <Link
                        to={`/product/${item.product.id}`}
                        onClick={closeCart}
                        className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="font-display text-lg text-nike-black dark:text-white hover:text-nike-orange transition-colors truncate block"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p className="font-display text-lg text-nike-orange mt-1">
                          ${item.product.price}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-nike-orange hover:text-white transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-nike-orange hover:text-white transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleRemove(
                                item.product.id,
                                item.size,
                                item.color,
                                item.product.name
                              )
                            }
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-display text-2xl text-nike-black dark:text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full py-4 bg-nike-orange text-white text-center rounded-full font-semibold hover:shadow-nike transition-shadow"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="block w-full py-3 text-red-500 text-center hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
