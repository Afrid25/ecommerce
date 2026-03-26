import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const CartPage = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();
  const shipping = total > 150 ? 0 : 15;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  const handleRemove = (productId: string, size: string, color: string, name: string) => {
    removeItem(productId, size, color);
    toast.success(`${name} removed from cart`);
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-white dark:bg-nike-black pt-32 pb-20"
      >
        <div className="container-nike">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <ShoppingBag className="w-14 h-14 text-gray-400" />
            </motion.div>
            <h1 className="font-display text-4xl text-nike-black dark:text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-nike-orange text-white px-8 py-4 rounded-full font-semibold hover:shadow-nike transition-shadow"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-nike-black pt-32 pb-20"
    >
      <div className="container-nike">
        <h1 className="font-display text-5xl text-nike-black dark:text-white mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 bg-nike-gray-50 dark:bg-white/5 rounded-2xl p-6"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product.id}`}
                  className="w-32 h-32 bg-white rounded-xl overflow-hidden flex-shrink-0"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={`/product/${item.product.id}`}
                        className="font-display text-xl text-nike-black dark:text-white hover:text-nike-orange transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-500 text-sm mt-1">
                        Size: {item.size} | Color: {item.color}
                      </p>
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
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-3">
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
                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-nike-orange hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="w-8 text-center font-medium text-lg">
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
                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-nike-orange hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {/* Price */}
                    <span className="font-display text-2xl text-nike-black dark:text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            <Button variant="outline" onClick={clearCart} className="w-full">
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-nike-gray-50 dark:bg-white/5 rounded-2xl p-8 sticky top-32">
              <h2 className="font-display text-2xl text-nike-black dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-sm text-green-600">
                    You qualified for free shipping!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-display text-xl text-nike-black dark:text-white">
                    Total
                  </span>
                  <span className="font-display text-2xl text-nike-orange">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full py-4 bg-nike-orange text-white text-center rounded-full font-semibold text-lg hover:shadow-nike transition-shadow mb-4"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/shop"
                className="block w-full py-4 border-2 border-gray-200 dark:border-gray-700 text-nike-black dark:text-white text-center rounded-full font-semibold hover:border-nike-orange transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;
