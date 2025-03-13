
import React from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <LoaderCircle className="w-12 h-12 text-delight-600" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-delight-700 font-medium"
      >
        جاري التحميل...
      </motion.p>
    </div>
  );
};

export default PageLoader;
