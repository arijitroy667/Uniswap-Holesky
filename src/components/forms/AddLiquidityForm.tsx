import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LiquidityAnimation } from '../animations';
import { cn } from '../../utils/cn';

interface AddLiquidityFormProps {
  ethBalance: string;
  usdcBalance: string;
  ethReserve: string;
  usdcReserve: string;
  loading: boolean;
  onSubmit: (ethAmount: string, usdcAmount: string) => Promise<void>;
}

const AddLiquidityForm: React.FC<AddLiquidityFormProps> = ({
  ethBalance,
  usdcBalance,
  ethReserve,
  usdcReserve,
  loading,
  onSubmit
}) => {
  const [ethInput, setEthInput] = useState('');
  const [usdcInput, setUsdcInput] = useState('');
  const [focusedInput, setFocusedInput] = useState<'eth' | 'usdc' | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Handle balance click to prefill max
  const handleMaxEth = () => {
    // Leave some ETH for gas
    const maxEth = Math.max(0, parseFloat(ethBalance) - 0.01).toFixed(6);
    setEthInput(maxEth);
    updatePairValue(maxEth, 'eth');
  };
  
  const handleMaxUsdc = () => {
    setUsdcInput(usdcBalance);
    updatePairValue(usdcBalance, 'usdc');
  };
  
  // Update paired value if pool exists (maintains ratio)
  const updatePairValue = (value: string, changedToken: 'eth' | 'usdc') => {
    const isPoolInitialized = 
      parseFloat(ethReserve) > 0 && parseFloat(usdcReserve) > 0;
    
    if (!isPoolInitialized || !value) {
      return;
    }
    
    try {
      const numValue = parseFloat(value);
      
      if (changedToken === 'eth') {
        const ratio = parseFloat(usdcReserve) / parseFloat(ethReserve);
        const pairedValue = (numValue * ratio).toFixed(6);
        setUsdcInput(pairedValue);
      } else {
        const ratio = parseFloat(ethReserve) / parseFloat(usdcReserve);
        const pairedValue = (numValue * ratio).toFixed(6);
        setEthInput(pairedValue);
      }
    } catch (e) {
      // Ignore calculation errors
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !ethInput || !usdcInput) return;
    
    setShowAnimation(true);
    await onSubmit(ethInput, usdcInput);
    // Animation will be stopped by the parent component after tx completes
  };
  
  const isInitialPool = parseFloat(ethReserve) === 0 && parseFloat(usdcReserve) === 0;
  
  const buttonDisabled = 
    loading || 
    !ethInput || 
    !usdcInput || 
    parseFloat(ethInput) <= 0 || 
    parseFloat(usdcInput) <= 0 ||
    parseFloat(ethInput) > parseFloat(ethBalance) ||
    parseFloat(usdcInput) > parseFloat(usdcBalance);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-6 text-uniswap-white">
          {isInitialPool ? 'Create New Liquidity Pool' : 'Add Liquidity'}
        </h2>
        
        {showAnimation && (
          <div className="mb-6">
            <LiquidityAnimation 
              type="add" 
              animate={showAnimation} 
              onComplete={() => setShowAnimation(false)} 
            />
          </div>
        )}
        
        {isInitialPool && (
          <motion.div 
            className="mb-6 p-4 rounded-lg bg-uniswap-purple bg-opacity-10 border border-uniswap-purple border-opacity-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-uniswap-light-purple">
              You are the first liquidity provider!
              The ratio of tokens you add will set the price of this pool.
            </p>
          </motion.div>
        )}
        
        <div className="space-y-4">
          <div className="input-wrapper">
            <div className="p-4">
              <div className="flex justify-between">
                <label htmlFor="ethAmount" className="text-sm text-uniswap-light-gray mb-2">
                  ETH Amount
                </label>
                <button
                  type="button"
                  className="text-xs text-uniswap-pink"
                  onClick={handleMaxEth}
                >
                  MAX
                </button>
              </div>
              <div className="flex">
                <input
                  id="ethAmount"
                  type="number"
                  value={ethInput}
                  onChange={(e) => {
                    setEthInput(e.target.value);
                    updatePairValue(e.target.value, 'eth');
                  }}
                  onFocus={() => setFocusedInput('eth')}
                  onBlur={() => setFocusedInput(null)}
                  min="0.000001"
                  step="0.01"
                  placeholder="0.0"
                  className={cn(
                    "input-field",
                    focusedInput === 'eth' && "border-uniswap-pink"
                  )}
                  required
                />
                <div className="pl-2 flex items-center bg-uniswap-gray bg-opacity-20 rounded-r-xl px-3">
                  <span className="text-uniswap-white">ETH</span>
                </div>
              </div>
              <small className="text-xs text-uniswap-light-gray mt-1">
                Available: {parseFloat(ethBalance).toFixed(4)} ETH
              </small>
            </div>
          </div>
          
          <div className="flex justify-center my-2">
            <div className="w-8 h-8 rounded-full bg-uniswap-gray bg-opacity-20 flex items-center justify-center">
              <span className="text-uniswap-light-gray">+</span>
            </div>
          </div>
          
          <div className="input-wrapper">
            <div className="p-4">
              <div className="flex justify-between">
                <label htmlFor="usdcAmount" className="text-sm text-uniswap-light-gray mb-2">
                  USDC Amount
                </label>
                <button
                  type="button"
                  className="text-xs text-uniswap-pink"
                  onClick={handleMaxUsdc}
                >
                  MAX
                </button>
              </div>
              <div className="flex">
                <input
                  id="usdcAmount"
                  type="number"
                  value={usdcInput}
                  onChange={(e) => {
                    setUsdcInput(e.target.value);
                    updatePairValue(e.target.value, 'usdc');
                  }}
                  onFocus={() => setFocusedInput('usdc')}
                  onBlur={() => setFocusedInput(null)}
                  min="0.000001"
                  step="0.01"
                  placeholder="0.0"
                  className={cn(
                    "input-field",
                    focusedInput === 'usdc' && "border-uniswap-pink"
                  )}
                  required
                />
                <div className="pl-2 flex items-center bg-uniswap-gray bg-opacity-20 rounded-r-xl px-3">
                  <span className="text-uniswap-white">USDC</span>
                </div>
              </div>
              <small className="text-xs text-uniswap-light-gray mt-1">
                Available: {parseFloat(usdcBalance).toFixed(4)} USDC
              </small>
            </div>
          </div>
          
          {!isInitialPool && ethInput && usdcInput && (
            <motion.div 
              className="mt-4 p-4 rounded-lg bg-uniswap-blue bg-opacity-10 border border-uniswap-blue border-opacity-20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-uniswap-light-gray text-sm">
                  Current Pool Ratio
                </span>
                <span className="text-uniswap-white">
                  1 ETH = {(parseFloat(usdcReserve) / parseFloat(ethReserve)).toFixed(4)} USDC
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-uniswap-light-gray text-sm">
                  Your Entry Ratio
                </span>
                <span className="text-uniswap-white">
                  1 ETH = {(parseFloat(usdcInput) / parseFloat(ethInput)).toFixed(4)} USDC
                </span>
              </div>
            </motion.div>
          )}
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
          {loading
            ? 'Processing...'
            : isInitialPool
              ? 'Create Pool'
              : 'Add Liquidity'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddLiquidityForm;