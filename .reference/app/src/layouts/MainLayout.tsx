import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopBar from '@/components/TopBar';

const MainLayout = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white dark:bg-nike-black"
    >
      <TopBar />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </motion.div>
  );
};

export default MainLayout;
