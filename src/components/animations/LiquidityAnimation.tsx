import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '../../utils/cn';

interface LiquidityAnimationProps {
  type: 'add' | 'remove';
  animate: boolean;
  onComplete?: () => void;
}

const LiquidityAnimation: React.FC<LiquidityAnimationProps> = ({ 
  type, 
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
  
  return (
    <div className="relative w-full h-40 overflow-hidden">
      {type === 'add' ? (
        <AddLiquidityAnimation 
          controls={controls} 
          onComplete={handleAnimationComplete} 
        />
      ) : (
        <RemoveLiquidityAnimation 
          controls={controls} 
          onComplete={handleAnimationComplete} 
        />
      )}
    </div>
  );
};

// Add Liquidity Animation
const AddLiquidityAnimation = ({ controls, onComplete }: { 
  controls: any;
  onComplete?: () => void;
}) => {
  const circleVariants = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: [0, 0.8, 0.4],
      transition: {
        duration: 2,
        ease: "easeOut",
      }
    }
  };
  
  const dropVariants = {
    initial: {
      y: -50,
      opacity: 0,
    },
    animate: {
      y: 60,
      opacity: [0, 1, 0],
      transition: {
        duration: 1.5,
        ease: "easeIn",
      }
    }
  };
  
  const rippleVariants = {
    initial: {
      scale: 0.3,
      opacity: 0,
    },
    animate: {
      scale: [0.3, 1],
      opacity: [0, 0.5, 0],
      transition: {
        duration: 1,
        delay: 1.3,
        ease: "easeOut",
      }
    }
  };
  
  return (
    <div className="relative h-full w-full flex justify-center items-center">
      {/* Pool background */}
      <motion.div 
        className="absolute bottom-0 h-1/2 w-3/4 bg-gradient-to-t from-uniswap-purple to-uniswap-pink opacity-40 rounded-t-full"
        initial={{ height: '30%' }}
        animate={controls}
        variants={{
          initial: { height: '30%' },
          animate: { 
            height: '60%',
            transition: { delay: 1.5, duration: 1.2 } 
          }
        }}
      />
      
      {/* Ripple effect */}
      <motion.div 
        className="absolute bottom-0 w-3/4 aspect-square rounded-full border-2 border-uniswap-pink border-opacity-30"
        initial="initial"
        animate={controls}
        variants={rippleVariants}
        onAnimationComplete={onComplete}
      />
      
      {/* ETH Drop */}
      <motion.div 
        className="absolute w-10 h-10 rounded-full top-0 left-1/3 bg-uniswap-blue opacity-80"
        initial="initial"
        animate={controls}
        variants={dropVariants}
      />
      
      {/* USDC Drop */}
      <motion.div 
        className="absolute w-10 h-10 rounded-full top-0 right-1/3 bg-uniswap-pink opacity-80"
        initial="initial"
        animate={controls}
        variants={{
          ...dropVariants,
          animate: {
            ...dropVariants.animate,
            transition: {
              ...dropVariants.animate.transition,
              delay: 0.3
            }
          }
        }}
      />
      
      {/* Glow effect */}
      <motion.div 
        className="absolute bottom-1/4 w-20 h-20 rounded-full bg-uniswap-pink"
        initial="initial"
        animate={controls}
        variants={circleVariants}
        style={{ filter: 'blur(20px)' }}
      />
    </div>
  );
};

// Remove Liquidity Animation
const RemoveLiquidityAnimation = ({ controls, onComplete }: { 
  controls: any;
  onComplete?: () => void;
}) => {
  const poolVariants = {
    initial: {
      height: '60%',
    },
    animate: {
      height: '30%',
      transition: {
        duration: 1.2
      }
    }
  };
  
  const dropVariants = {
    initial: {
      y: 0,
      opacity: 0,
    },
    animate: {
      y: -80,
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 1.5,
        delay: 0.8,
        ease: "easeOut",
      }
    }
  };
  
  const particleVariants = {
    initial: {
      y: 0,
      x: 0,
      opacity: 0,
    },
    animate: (i: number) => ({
      y: -30 - (i * 10),
      x: (i % 2 === 0 ? 1 : -1) * (i * 5),
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        delay: 0.5 + (i * 0.1),
        ease: "easeOut",
      }
    })
  };
  
  return (
    <div className="relative h-full w-full flex justify-center items-center">
      {/* Pool background */}
      <motion.div 
        className="absolute bottom-0 h-3/5 w-3/4 bg-gradient-to-t from-uniswap-purple to-uniswap-pink opacity-40 rounded-t-full"
        initial="initial"
        animate={controls}
        variants={poolVariants}
      />
      
      {/* ETH Particle */}
      <motion.div 
        className="absolute bottom-1/3 left-1/3 w-8 h-8 rounded-full bg-uniswap-blue opacity-80"
        initial="initial"
        animate={controls}
        variants={dropVariants}
        custom={1}
      />
      
      {/* USDC Particle */}
      <motion.div 
        className="absolute bottom-1/3 right-1/3 w-8 h-8 rounded-full bg-uniswap-pink opacity-80"
        initial="initial"
        animate={controls}
        variants={dropVariants}
        custom={2}
        onAnimationComplete={onComplete}
      />
      
      {/* Small particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div 
          key={i}
          className={cn(
            "absolute bottom-1/3 w-3 h-3 rounded-full",
            i % 2 === 0 ? "bg-uniswap-blue" : "bg-uniswap-pink"
          )}
          style={{
            left: `${45 + (i * 2)}%`,
          }}
          initial="initial"
          animate={controls}
          variants={particleVariants}
          custom={i}
        />
      ))}
    </div>
  );
};

export default LiquidityAnimation;