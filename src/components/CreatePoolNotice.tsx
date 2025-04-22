import React from 'react';
import { motion } from 'framer-motion';
import { DropletIcon } from 'lucide-react';

interface CreatePoolNoticeProps {
  onClick: () => void;
}

const CreatePoolNotice: React.FC<CreatePoolNoticeProps> = ({ onClick }) => {
  return (
    <motion.div 
      className="card my-6 text-center p-8 border border-uniswap-purple border-opacity-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.div 
        className="mb-4 inline-block"
        animate={{ 
          rotate: [0, 10, -10, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        <DropletIcon size={48} className="text-uniswap-purple" />
      </motion.div>
      
      <h3 className="text-xl font-semibold mb-2 gradient-text">No Liquidity Pool Yet!</h3>
      
      <p className="text-uniswap-light-gray mb-6">
        Be the first to create this ETH-USDC pool by adding initial liquidity.
        <br />You'll set the initial exchange rate!
      </p>
      
      <motion.button 
        className="btn btn-primary px-8"
        onClick={onClick}
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(155, 81, 224, 0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Create ETH-USDC Pool
      </motion.button>
    </motion.div>
  );
};

export default CreatePoolNotice;