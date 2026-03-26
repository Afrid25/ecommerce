import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useProductStore } from '@/store/productStore';

const stats = [
  { 
    name: 'Total Revenue', 
    value: '$124,500', 
    change: '+12.5%', 
    trend: 'up',
    icon: DollarSign 
  },
  { 
    name: 'Total Orders', 
    value: '1,429', 
    change: '+8.2%', 
    trend: 'up',
    icon: ShoppingBag 
  },
  { 
    name: 'Total Customers', 
    value: '3,842', 
    change: '+15.3%', 
    trend: 'up',
    icon: Users 
  },
  { 
    name: 'Products Sold', 
    value: '2,847', 
    change: '-2.4%', 
    trend: 'down',
    icon: Package 
  },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'John Doe', product: 'Air Max Pulse', amount: 159.99, status: 'delivered' },
  { id: '#ORD-002', customer: 'Jane Smith', product: 'Air Force 1', amount: 110.00, status: 'shipped' },
  { id: '#ORD-003', customer: 'Mike Johnson', product: 'Dunk Low', amount: 115.00, status: 'pending' },
  { id: '#ORD-004', customer: 'Sarah Williams', product: 'Jordan 1 Mid', amount: 125.00, status: 'processing' },
  { id: '#ORD-005', customer: 'Tom Brown', product: 'Pegasus 40', amount: 130.00, status: 'delivered' },
];

const AdminDashboard = () => {
  const { products } = useProductStore();
  const lowStockProducts = products.filter(p => p.stock < 30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-nike-black dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-white/5 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.name}</p>
                <p className="font-display text-3xl text-nike-black dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 bg-nike-orange/10 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-nike-orange" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {stat.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
              <span className="text-gray-400 text-sm">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl">Recent Orders</h2>
            <button className="text-nike-orange hover:underline text-sm">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl"
              >
                <div>
                  <p className="font-medium text-nike-black dark:text-white">
                    {order.id}
                  </p>
                  <p className="text-sm text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-nike-black dark:text-white">
                    ${order.amount.toFixed(2)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-600'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-600'
                        : order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl">Low Stock Alert</h2>
            <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
              {lowStockProducts.length} items
            </span>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-nike-black dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-500">
                    {product.stock} left
                  </p>
                  <button className="text-sm text-nike-orange hover:underline">
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sales Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Sales Overview</h2>
          <select className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
        <div className="h-64 bg-gradient-to-r from-nike-orange/10 to-nike-orange/5 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-nike-orange mx-auto mb-4" />
            <p className="text-gray-500">Sales chart visualization</p>
            <p className="text-sm text-gray-400">Connect to analytics API for real data</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
