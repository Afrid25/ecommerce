import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Percent, Tag, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const AdminOffers = () => {
  const { offers } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleToggleActive = (_offerId: string, isActive: boolean) => {
    toast.success(`Offer ${isActive ? 'deactivated' : 'activated'}`);
  };

  const handleDelete = (_offerId: string) => {
    toast.success('Offer deleted successfully');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-nike-black dark:text-white mb-2">
            Offers & Campaigns
          </h1>
          <p className="text-gray-500">
            Manage discounts, coupons, and promotional campaigns
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-nike-orange hover:bg-nike-orange/90 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Create New Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-gray-500">Offer creation form would go here...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Offers', value: '12', icon: Tag },
          { label: 'Total Claims', value: '3,847', icon: Percent },
          { label: 'Revenue Generated', value: '$45,200', icon: Tag },
          { label: 'Avg. Discount', value: '18%', icon: Percent },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-white/5 rounded-xl p-4"
          >
            <stat.icon className="w-6 h-6 text-nike-orange mb-2" />
            <p className="text-2xl font-display">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-white/5 rounded-2xl p-6 relative"
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <Switch
                checked={offer.isActive}
                onCheckedChange={(checked) => handleToggleActive(offer.id, checked)}
              />
            </div>

            {/* Icon */}
            <div className="w-12 h-12 bg-nike-orange/10 rounded-xl flex items-center justify-center mb-4">
              <Tag className="w-6 h-6 text-nike-orange" />
            </div>

            {/* Content */}
            <h3 className="font-display text-xl text-nike-black dark:text-white mb-2">
              {offer.title}
            </h3>
            <p className="text-gray-500 text-sm mb-4">{offer.description}</p>

            {/* Discount */}
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-nike-orange" />
              <span className="font-display text-2xl text-nike-orange">
                {offer.discountType === 'percentage'
                  ? `${offer.discountValue}%`
                  : `$${offer.discountValue}`}
                {' '}OFF
              </span>
            </div>

            {/* Code */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <code className="font-mono text-lg">{offer.code}</code>
                <button
                  onClick={() => handleCopyCode(offer.code)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
              </span>
            </div>

            {/* Usage */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Used {offer.usedCount} {offer.maxUses && `/ ${offer.maxUses}`} times
              </span>
              {offer.minOrderAmount && (
                <span className="text-gray-500">
                  Min. ${offer.minOrderAmount}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-16">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => handleDelete(offer.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOffers.length === 0 && (
        <div className="text-center py-20">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl text-gray-500 mb-2">
            No offers found
          </h3>
          <p className="text-gray-400">
            Create your first promotional offer to get started
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AdminOffers;
