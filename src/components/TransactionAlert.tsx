import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ExternalLinkIcon } from 'lucide-react';
import { CheckMark } from './animations';
import { cn } from '../utils/cn';
import Particles from './animations/Particles';

interface TransactionAlertProps {
  type: 'success' | 'error';
  message: string;
  txHash?: string;
  onDismiss?: () => void;
}

const TransactionAlert: React.FC<TransactionAlertProps> = ({ 
  type, 
  message, 
  txHash,
  onDismiss
}) => {
  const controls = useAnimation();
  
  useEffect(() => {
    // Animate in
    controls.start({
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    });
    
    // Auto dismiss after 8 seconds for success
    if (type === 'success' && onDismiss) {
      const timer = setTimeout(() => {
        dismissAlert();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [type]);
  
  const dismissAlert = async () => {
    await controls.start({
      opacity: 0, 
      y: 20,
      transition: { duration: 0.3, ease: 'easeIn' }
    });
    if (onDismiss) onDismiss();
  };
  
  return (
    <motion.div 
      className={cn(
        "relative my-6 p-6 rounded-xl shadow-lg overflow-hidden",
        type === 'success' ? "bg-success bg-opacity-10" : "bg-error bg-opacity-10",
        "border",
        type === 'success' ? "border-success" : "border-error",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
    >
      {type === 'success' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Particles count={40} type="confirm" />
        </div>
      )}
      
      <div className="flex items-center">
        {type === 'success' && (
          <div className="mr-4">
            <CheckMark size="md" />
          </div>
        )}
        
        <div className="flex-1">
          <p className={cn(
            "text-lg font-medium mb-1",
            type === 'success' ? "text-success" : "text-error"
          )}>
            {type === 'success' ? 'Transaction Successful' : 'Transaction Failed'}
          </p>
          <p className="text-uniswap-white">{message}</p>
          
          {txHash && (
            <motion.a
              href={`https://holesky.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center text-sm mt-3 hover:underline",
                type === 'success' ? "text-success" : "text-error"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              View on Etherscan
              <ExternalLinkIcon size={14} className="ml-1" />
            </motion.a>
          )}
        </div>
        
        <button 
          onClick={dismissAlert}
          className="text-uniswap-light-gray hover:text-uniswap-white ml-2"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export default TransactionAlert;