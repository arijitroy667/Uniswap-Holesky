import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LiquidityAnimation } from '../animations';
import { cn } from '../../utils/cn';

interface RemoveLiquidityFormProps {
  lpBalance: string;
  ethReserve: string;
  usdcReserve: string;
  loading: boolean;
  onSubmit: (lpAmount: string) => Promise<void>;
}

const RemoveLiquidityForm: React.FC<RemoveLiquidityFormProps> = ({
  lpBalance,
  ethReserve,
  usdcReserve,
  loading,
  onSubmit
}) => {
  const [lpInput, setLpInput] = useState('');
  const [percentValue, setPercentValue] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Calculate expected returns
  const calculateReturns = () => {
    if (!lpInput || parseFloat(lpBalance) === 0) {
      return { eth: '0', usdc: '0' };
    }
    
    const shareRatio = parseFloat(lpInput) / parseFloat(lpBalance);
    const ethReturn = (parseFloat(ethReserve) * shareRatio).toFixed(6);
    const usdcReturn = (parseFloat(usdcReserve) * shareRatio).toFixed(6);
    
    return { eth: ethReturn, usdc: usdcReturn };
  };
  
  const { eth: expectedEth, usdc: expectedUsdc } = calculateReturns();
  
  // Handle percentage buttons
  const handlePercentageClick = (percent: number) => {
    const amount = (parseFloat(lpBalance) * (percent / 100)).toFixed(6);
    setLpInput(amount);
    setPercentValue(percent);
  };
  
  // Handle max button
  const handleMax = () => {
    setLpInput(lpBalance);
    setPercentValue(100);
  };
  
  // Handle input change and update percentage
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLpInput(value);
    
    if (!value || parseFloat(lpBalance) === 0) {
      setPercentValue(0);
      return;
    }
    
    const percent = Math.min(100, (parseFloat(value) / parseFloat(lpBalance)) * 100);
    setPercentValue(Math.round(percent));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !lpInput) return;
    
    setShowAnimation(true);
    await onSubmit(lpInput);
    // Animation will be stopped by the parent component after tx completes
  };
  
  const buttonDisabled =
    loading ||
    !lpInput ||
    parseFloat(lpInput) <= 0 ||
    parseFloat(lpInput) > parseFloat(lpBalance);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-6 text-uniswap-white">
          Remove Liquidity
        </h2>
        
        {showAnimation && (
          <div className="mb-6">
            <LiquidityAnimation 
              type="remove" 
              animate={showAnimation} 
              onComplete={() => setShowAnimation(false)} 
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="input-wrapper">
            <div className="p-4">
              <div className="flex justify-between">
                <label htmlFor="lpAmount" className="text-sm text-uniswap-light-gray mb-2">
                  LP Token Amount
                </label>
                <button
                  type="button"
                  className="text-xs text-uniswap-pink"
                  onClick={handleMax}
                >
                  MAX
                </button>
              </div>
              <div className="flex">
                <input
                  id="lpAmount"
                  type="number"
                  value={lpInput}
                  onChange={handleInputChange}
                  min="0.000001"
                  max={lpBalance}
                  step="0.0001"
                  placeholder="0.0"
                  className="input-field"
                  required
                />
                <div className="pl-2 flex items-center bg-uniswap-gray bg-opacity-20 rounded-r-xl px-3">
                  <span className="text-uniswap-white">LP</span>
                </div>
              </div>
              <small className="text-xs text-uniswap-light-gray mt-1">
                Available: {parseFloat(lpBalance).toFixed(6)} LP
              </small>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <motion.button
                key={percent}
                type="button"
                className={cn(
                  "py-1 text-sm rounded-md",
                  percentValue === percent
                    ? "bg-uniswap-pink text-white"
                    : "bg-uniswap-gray bg-opacity-20 text-uniswap-light-gray"
                )}
                onClick={() => handlePercentageClick(percent)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {percent}%
              </motion.button>
            ))}
          </div>
          
          <motion.div 
            className="mt-4 p-4 rounded-lg bg-uniswap-blue bg-opacity-10 border border-uniswap-blue border-opacity-20"
            animate={{ 
              opacity: lpInput && parseFloat(lpInput) > 0 ? 1 : 0.5 
            }}
          >
            <h3 className="text-base font-medium text-uniswap-white mb-3">
              You Will Receive
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-uniswap-light-gray">ETH</span>
                <span className="text-uniswap-white font-medium">
                  {expectedEth}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-uniswap-light-gray">USDC</span>
                <span className="text-uniswap-white font-medium">
                  {expectedUsdc}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.button
          type="submit"
          className={cn(
            "btn w-full mt-6 gradient-animation",
            buttonDisabled ? "opacity-50 cursor-not-allowed" : "btn-primary"
          )}
          disabled={buttonDisabled}
          whileHover={!buttonDisabled ? { scale: 1.02 } : {}}
          whileTap={!buttonDisabled ? { scale: 0.98 } : {}}
        >
          {loading ? 'Processing...' : 'Remove Liquidity'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default RemoveLiquidityForm;