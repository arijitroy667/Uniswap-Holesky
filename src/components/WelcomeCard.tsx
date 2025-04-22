import React from 'react';
import { motion } from 'framer-motion';
import { DropletIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface WelcomeCardProps {
  onConnectWallet: () => Promise<void>;
  error: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ onConnectWallet, error }) => {
  return (
    <motion.div 
      className="card max-w-md mx-auto py-10 px-6 my-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut"
        }}
        className="inline-block mb-6"
      >
        <DropletIcon 
          size={64} 
          className="text-uniswap-pink" 
          strokeWidth={1.5} 
        />
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-2 gradient-text">Welcome to Uniswap</h2>
      <p className="text-uniswap-light-gray mb-8">
        Experience decentralized trading on the Holesky testnet
      </p>
      
      <motion.button 
        className={cn(
          "btn btn-primary w-full mb-6",
          "gradient-animation"
        )}
        onClick={onConnectWallet}
        whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(252, 114, 255, 0.5)" }}
        whileTap={{ scale: 0.97 }}
      >
        Connect Wallet
      </motion.button>
      
      {error && (
        <motion.div 
          className="text-error bg-error bg-opacity-10 p-3 rounded-lg text-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {error}
        </motion.div>
      )}
      
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-uniswap-pink opacity-10 blur-[100px] rounded-full z-0"></div>
      <div className="absolute -top-5 -left-5 w-20 h-20 bg-uniswap-blue opacity-10 blur-[80px] rounded-full z-0"></div>
    </motion.div>
  );
};

export default WelcomeCard;