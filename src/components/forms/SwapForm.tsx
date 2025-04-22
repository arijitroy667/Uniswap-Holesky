import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, RefreshCwIcon } from 'lucide-react';
import { SwapAnimation } from '../animations';
import { cn } from '../../utils/cn';

interface SwapFormProps {
  ethBalance: string;
  usdcBalance: string;
  swapDirection: 'ethToUsdc' | 'usdcToEth';
  onDirectionChange: (direction: 'ethToUsdc' | 'usdcToEth') => void;
  getSwapQuote: (amount: string) => Promise<string>;
  loading: boolean;
  onSubmit: (amount: string, minOutput: string) => Promise<void>;
}

const SwapForm: React.FC<SwapFormProps> = ({
  ethBalance,
  usdcBalance,
  swapDirection,
  onDirectionChange,
  getSwapQuote,
  loading,
  onSubmit
}) => {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [focusedInput, setFocusedInput] = useState<'input' | 'output' | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  
  const inputToken = swapDirection === 'ethToUsdc' ? 'ETH' : 'USDC';
  const outputToken = swapDirection === 'ethToUsdc' ? 'USDC' : 'ETH';
  const inputBalance = swapDirection === 'ethToUsdc' ? ethBalance : usdcBalance;
  
  // Handle balance click to prefill max
  const handleMax = () => {
    let maxValue;
    
    if (swapDirection === 'ethToUsdc') {
      // Leave some ETH for gas
      maxValue = Math.max(0, parseFloat(ethBalance) - 0.01).toFixed(6);
    } else {
      maxValue = usdcBalance;
    }
    
    setInputAmount(maxValue);
  };
  
  // Get output quote when input changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!inputAmount || parseFloat(inputAmount) <= 0) {
        setOutputAmount('');
        return;
      }
      
      try {
        setQuoteLoading(true);
        const quote = await getSwapQuote(inputAmount);
        setOutputAmount(quote);
      } catch (error) {
        console.error('Error getting quote:', error);
        setOutputAmount('');
      } finally {
        setQuoteLoading(false);
      }
    };
    
    fetchQuote();
  }, [inputAmount, swapDirection, getSwapQuote]);
  
  // Handle direction toggle with animation
  const handleDirectionToggle = () => {
    setIsFlipping(true);
    setInputAmount('');
    setOutputAmount('');
    
    // Switch direction after animation
    setTimeout(() => {
      onDirectionChange(swapDirection === 'ethToUsdc' ? 'usdcToEth' : 'ethToUsdc');
      setIsFlipping(false);
    }, 400);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !inputAmount || !outputAmount) return;
    
    // Calculate minimum output with 5% slippage tolerance
    const minOutput = (parseFloat(outputAmount) * 0.95).toFixed(6);
    
    setShowAnimation(true);
    await onSubmit(inputAmount, minOutput);
    // Animation will be stopped by the parent component after tx completes
  };
  
  const buttonDisabled =
    loading ||
    !inputAmount ||
    !outputAmount ||
    parseFloat(inputAmount) <= 0 ||
    parseFloat(inputAmount) > parseFloat(inputBalance);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-6 text-uniswap-white">
          Swap Tokens
        </h2>
        
        {showAnimation && (
          <div className="mb-6">
            <SwapAnimation 
              direction={swapDirection} 
              animate={showAnimation} 
              onComplete={() => setShowAnimation(false)} 
            />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="input-wrapper">
            <div className="p-4">
              <div className="flex justify-between">
                <label className="text-sm text-uniswap-light-gray mb-2">
                  You Pay
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
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  onFocus={() => setFocusedInput('input')}
                  onBlur={() => setFocusedInput(null)}
                  min="0.000001"
                  step="0.01"
                  placeholder="0.0"
                  className={cn(
                    "input-field",
                    focusedInput === 'input' && "border-uniswap-pink"
                  )}
                  required
                />
                <motion.div 
                  className="pl-2 flex items-center bg-uniswap-gray bg-opacity-20 rounded-r-xl px-3"
                  initial={false}
                  animate={isFlipping ? { scale: [1, 0.9, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-uniswap-white">{inputToken}</span>
                </motion.div>
              </div>
              <small className="text-xs text-uniswap-light-gray mt-1">
                Available: {parseFloat(inputBalance).toFixed(4)} {inputToken}
              </small>
            </div>
          </div>
          
          <div className="flex justify-center my-2">
            <motion.button
              type="button"
              className="w-10 h-10 rounded-full bg-uniswap-gray bg-opacity-20 flex items-center justify-center hover:bg-uniswap-gray hover:bg-opacity-30 transition-colors"
              onClick={handleDirectionToggle}
              whileHover={{ rotate: 180, backgroundColor: 'rgba(252, 114, 255, 0.2)' }}
              transition={{ duration: 0.3 }}
            >
              <ArrowDown className="text-uniswap-pink" size={20} />
            </motion.button>
          </div>
          
          <div className="input-wrapper">
            <div className="p-4">
              <div className="flex justify-between">
                <label className="text-sm text-uniswap-light-gray mb-2">
                  You Receive (estimated)
                </label>
                {quoteLoading && (
                  <RefreshCwIcon size={16} className="text-uniswap-light-gray animate-spin" />
                )}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={outputAmount ? parseFloat(outputAmount).toFixed(6) : ''}
                  readOnly
                  placeholder="0.0"
                  className="input-field bg-uniswap-gray bg-opacity-10"
                />
                <motion.div 
                  className="pl-2 flex items-center bg-uniswap-gray bg-opacity-20 rounded-r-xl px-3"
                  initial={false}
                  animate={isFlipping ? { scale: [1, 0.9, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-uniswap-white">{outputToken}</span>
                </motion.div>
              </div>
              <small className="text-xs text-uniswap-light-gray mt-1">
                Includes 0.3% fee • 5% slippage tolerance
              </small>
            </div>
          </div>
          
          {inputAmount && outputAmount && (
            <motion.div 
              className="mt-4 p-4 rounded-lg bg-uniswap-blue bg-opacity-10 border border-uniswap-blue border-opacity-20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-uniswap-light-gray text-sm">
                  Rate
                </span>
                <span className="text-uniswap-white">
                  1 {inputToken} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(4)} {outputToken}
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
          {loading ? 'Processing...' : 'Swap'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default SwapForm;