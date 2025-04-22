import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '../utils/cn';

interface PoolInfoProps {
  ethReserve: string;
  usdcReserve: string;
}

const PoolInfo: React.FC<PoolInfoProps> = ({ ethReserve, usdcReserve }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the card
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Update motion values
    mouseX.set(x);
    mouseY.set(y);
  };
  
  // Transform the mouse position to rotate the card
  const rotateX = useTransform(mouseY, [0, 300], [2, -2]);
  const rotateY = useTransform(mouseX, [0, 500], [-2, 2]);
  
  // Calculate exchange rate
  const exchangeRate = parseFloat(ethReserve) > 0 
    ? (parseFloat(usdcReserve) / parseFloat(ethReserve)).toFixed(4) 
    : '0';
  
  return (
    <motion.div 
      ref={cardRef}
      className="perspective-container my-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onMouseMove={handleMouseMove}
    >
      <motion.div 
        className={cn(
          "card overflow-hidden",
          "border border-uniswap-gray border-opacity-20",
        )}
        style={{ 
          rotateX, 
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ boxShadow: "0 8px 32px rgba(252, 114, 255, 0.2)" }}
      >
        <h2 className="text-xl font-semibold mb-4 text-uniswap-white">Pool Information</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-uniswap-light-gray">ETH Reserve</span>
            <motion.span 
              className="text-uniswap-white font-medium"
              animate={{ 
                color: parseFloat(ethReserve) > 0 ? "#FFFFFF" : "#FC72FF"
              }}
              initial={false}
              transition={{ duration: 0.3 }}
            >
              {parseFloat(ethReserve).toFixed(4)}
            </motion.span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-uniswap-light-gray">USDC Reserve</span>
            <motion.span 
              className="text-uniswap-white font-medium"
              animate={{ 
                color: parseFloat(usdcReserve) > 0 ? "#FFFFFF" : "#FC72FF" 
              }}
              initial={false}
              transition={{ duration: 0.3 }}
            >
              {parseFloat(usdcReserve).toFixed(4)}
            </motion.span>
          </div>
          
          <div className="pt-2 border-t border-uniswap-gray border-opacity-30 flex justify-between items-center">
            <span className="text-uniswap-light-gray">Exchange Rate</span>
            <div>
              <span className="text-uniswap-pink font-medium">{exchangeRate}</span>
              <span className="text-uniswap-light-gray ml-1">USDC per ETH</span>
            </div>
          </div>
        </div>
        
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-uniswap-pink opacity-10 blur-[100px] rounded-full z-0"></div>
        <div className="absolute -top-5 -left-5 w-20 h-20 bg-uniswap-blue opacity-10 blur-[80px] rounded-full z-0"></div>
      </motion.div>
    </motion.div>
  );
};

export default PoolInfo;