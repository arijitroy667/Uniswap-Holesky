import React from 'react';
import { motion } from 'framer-motion';
import { DropletIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface HeaderProps {
  account: string | null;
  ethBalance: string;
  usdcBalance: string;
  lpBalance: string;
  onConnectWallet: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ 
  account, 
  ethBalance, 
  usdcBalance, 
  lpBalance, 
  onConnectWallet 
}) => {
  return (
    <header className="flex justify-between items-center p-6 relative z-10">
      <motion.div 
        className="flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DropletIcon 
          size={32} 
          className="text-uniswap-pink mr-2" 
          strokeWidth={1.5} 
        />
        <h1 className="text-2xl font-bold gradient-text">
          Uniswap <span className="text-uniswap-light-gray text-lg font-normal">on Holesky</span>
        </h1>
      </motion.div>
      
      {!account ? (
        <motion.button 
          className="btn btn-primary px-6"
          onClick={onConnectWallet}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Connect Wallet
        </motion.button>
      ) : (
        <motion.div 
          className="text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-uniswap-light-gray text-sm mb-1">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <div className="flex gap-3">
            <motion.div 
              className={cn(
                "py-1 px-3 rounded-full text-xs font-medium",
                "bg-uniswap-gray text-uniswap-light-purple"
              )}
              whileHover={{ scale: 1.05 }}
            >
              {parseFloat(ethBalance).toFixed(4)} ETH
            </motion.div>
            <motion.div 
              className={cn(
                "py-1 px-3 rounded-full text-xs font-medium",
                "bg-uniswap-gray text-uniswap-light-purple"
              )}
              whileHover={{ scale: 1.05 }}
            >
              {parseFloat(usdcBalance).toFixed(4)} USDC
            </motion.div>
            <motion.div 
              className={cn(
                "py-1 px-3 rounded-full text-xs font-medium",
                "bg-uniswap-gray text-uniswap-light-purple"
              )}
              whileHover={{ scale: 1.05 }}
            >
              {parseFloat(lpBalance).toFixed(4)} LP
            </motion.div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;