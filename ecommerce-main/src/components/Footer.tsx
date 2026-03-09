export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">ShopBD</h3>
            <p className="text-sm">
              Your trusted e-commerce platform for quality products at the best prices.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/cart" className="hover:text-white transition">Cart</a></li>
              <li><a href="/admin/login" className="hover:text-white transition">Admin Login</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Payment Methods</h4>
            <ul className="space-y-2 text-sm">
              <li>💵 Cash on Delivery</li>
              <li>📱 bKash</li>
              <li>📱 Nagad</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ShopBD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
