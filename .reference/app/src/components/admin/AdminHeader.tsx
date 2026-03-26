import { motion } from 'framer-motion';
import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const AdminHeader = () => {
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-nike-black border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <svg
            className="w-8 h-8 text-nike-orange"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M15 25C15 25 30 5 55 5C70 5 80 12 80 22C80 32 65 35 50 35C35 35 15 25 15 25Z" />
          </svg>
          <span className="font-display text-xl">Admin Panel</span>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-nike-orange"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-nike-orange rounded-full" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nike-orange/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-nike-orange" />
            </div>
            <div className="hidden sm:block">
              <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
