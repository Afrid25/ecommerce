export default function Footer() {
  return (
    <footer className="bg-black dark:bg-white text-white dark:text-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-6">ShopBD</h3>
            <p className="text-sm leading-relaxed opacity-70">
              Premium e-commerce platform delivering quality products across Bangladesh with fast, reliable service.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-bold tracking-tight uppercase mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">New Arrivals</a></li>
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">Best Sellers</a></li>
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">Sale</a></li>
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">All Products</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold tracking-tight uppercase mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">Contact Us</a></li>
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">Shipping Info</a></li>
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">Returns</a></li>
              <li><a href="/" className="opacity-70 hover:opacity-100 transition">FAQ</a></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-sm font-bold tracking-tight uppercase mb-6">Payment</h4>
            <ul className="space-y-3 text-sm">
              <li className="opacity-70">💵 Cash on Delivery</li>
              <li className="opacity-70">📱 bKash</li>
              <li className="opacity-70">📱 Nagad</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 dark:border-gray-300 my-12"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="opacity-70 mb-4 md:mb-0">&copy; {new Date().getFullYear()} ShopBD. All rights reserved.</p>
          <div className="flex space-x-8">
            <a href="/" className="opacity-70 hover:opacity-100 transition">Privacy Policy</a>
            <a href="/" className="opacity-70 hover:opacity-100 transition">Terms of Service</a>
            <a href="/" className="opacity-70 hover:opacity-100 transition">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
