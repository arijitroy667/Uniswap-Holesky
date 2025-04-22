import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SwapAnimationProps {
  direction: 'ethToUsdc' | 'usdcToEth';
  animate: boolean;
  onComplete?: () => void;
}

const SwapAnimation: React.FC<SwapAnimationProps> = ({ 
  direction, 
  animate,
  onComplete
}) => {
  const controls = useAnimation();
  const completedRef = useRef(false);
  
  useEffect(() => {
    if (animate && !completedRef.current) {
      controls.start('animate');
    } else {
      controls.start('initial');
      completedRef.current = false;
    }
  }, [animate, controls]);
  
  const handleAnimationComplete = () => {
    if (animate) {
      completedRef.current = true;
      if (onComplete) onComplete();
    }
  };
  
  const fromColor = direction === 'ethToUsdc' ? '#2172E5' : '#FC72FF';
  const toColor = direction === 'ethToUsdc' ? '#FC72FF' : '#2172E5';
  
  const particleCircleVariants = {
    initial: { scale: 0, x: 0, opacity: 0 },
    animate: { 
      scale: [0, 1, 0.8],
      x: direction === 'ethToUsdc' ? [0, 200] : [0, -200],
      opacity: [0, 1, 0],
      transition: { duration: 1.2, ease: "easeInOut" }
    }
  };
  
  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1,
      opacity: [0, 0.5, 0],
      transition: { duration: 1, ease: "easeInOut" }
    }
  };
  
  const toCircleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1],
      opacity: [0, 0.8, 1],
      transition: { delay: 0.8, duration: 0.8, ease: "easeOut" }
    }
  };
  
  return (
    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden">
      {/* From token */}
      <motion.div 
        className="absolute w-16 h-16 rounded-full"
        style={{ backgroundColor: fromColor, left: direction === 'ethToUsdc' ? '25%' : '75%' }}
        initial={{ scale: 1 }}
        animate={controls}
        variants={{
          initial: { scale: 1, opacity: 1 },
          animate: { 
            scale: [1, 0.8, 0],
            opacity: [1, 0.7, 0],
            transition: { duration: 0.8 }
          }
        }}
      />
      
      {/* To token */}
      <motion.div 
        className="absolute w-16 h-16 rounded-full"
        style={{ backgroundColor: toColor, left: direction === 'ethToUsdc' ? '75%' : '25%' }}
        initial="initial"
        animate={controls}
        variants={toCircleVariants}
        onAnimationComplete={handleAnimationComplete}
      />
      
      {/* Moving particle */}
      <motion.div 
        className="absolute left-0 right-0 top-0 bottom-0 flex items-center"
        style={{ justifyContent: direction === 'ethToUsdc' ? 'flex-start' : 'flex-end', paddingLeft: '25%', paddingRight: '25%' }}
      >
        <motion.div 
          className="absolute w-10 h-10 rounded-full"
          style={{ backgroundColor: fromColor }}
          initial="initial"
          animate={controls}
          variants={particleCircleVariants}
        />
      </motion.div>
      
      {/* Path line */}
      <svg className="absolute w-full h-full" style={{ overflow: 'visible' }}>
        <motion.path
          d={`M ${direction === 'ethToUsdc' ? '25% 50%' : '75% 50%'} C ${direction === 'ethToUsdc' ? '40% 30%, 60% 70%' : '60% 30%, 40% 70%'}, ${direction === 'ethToUsdc' ? '75% 50%' : '25% 50%'}`}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeDasharray="5,5"
          initial="initial"
          animate={controls}
          variants={pathVariants}
        />
      </svg>
      
      {/* Glow effects */}
      <motion.div 
        className="absolute w-32 h-32 rounded-full"
        style={{ 
          backgroundColor: fromColor, 
          filter: 'blur(30px)',
          left: direction === 'ethToUsdc' ? '20%' : '70%',
          opacity: 0.3
        }}
        initial={{ scale: 1 }}
        animate={controls}
        variants={{
          initial: { scale: 1, opacity: 0.3 },
          animate: { 
            scale: [1, 0.5, 0],
            opacity: [0.3, 0.2, 0],
            transition: { duration: 0.8 }
          }
        }}
      />
      
      <motion.div 
        className="absolute w-32 h-32 rounded-full"
        style={{ 
          backgroundColor: toColor, 
          filter: 'blur(30px)',
          left: direction === 'ethToUsdc' ? '70%' : '20%',
          opacity: 0
        }}
        initial="initial"
        animate={controls}
        variants={{
          initial: { scale: 0, opacity: 0 },
          animate: { 
            scale: [0, 1],
            opacity: [0, 0.3],
            transition: { delay: 0.8, duration: 0.8 }
          }
        }}
      />
    </div>
  );
};

export default SwapAnimation;