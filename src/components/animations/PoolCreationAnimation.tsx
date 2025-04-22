import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface PoolCreationAnimationProps {
  animate: boolean;
  onComplete?: () => void;
}

const PoolCreationAnimation: React.FC<PoolCreationAnimationProps> = ({ 
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
    <div className="relative w-full h-60 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Central pool */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-uniswap-blue to-uniswap-pink relative z-10"
          initial="initial"
          animate={controls}
          variants={{
            initial: { scale: 0, opacity: 0 },
            animate: { 
              scale: [0, 1.2, 1],
              opacity: 1,
              transition: { 
                duration: 1.5,
                delay: 1.2,
                ease: "easeOut"
              }
            }
          }}
          onAnimationComplete={handleAnimationComplete}
        >
          {/* Inner Pool Glow */}
          <motion.div 
            className="absolute inset-2 rounded-full bg-white opacity-20"
            initial={{ scale: 0 }}
            animate={controls}
            variants={{
              initial: { scale: 0 },
              animate: { 
                scale: [0, 0.8, 0.6],
                opacity: [0, 0.5, 0.2],
                transition: { 
                  duration: 1.5,
                  delay: 1.5
                }
              }
            }}
          />
        </motion.div>
        
        {/* Background glow */}
        <motion.div
          className="absolute w-80 h-80 rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(252,114,255,0.3) 0%, rgba(0,0,0,0) 70%)',
            zIndex: 1
          }}
          initial="initial"
          animate={controls}
          variants={{
            initial: { scale: 0, opacity: 0 },
            animate: { 
              scale: [0, 1.5],
              opacity: [0, 0.4],
              transition: { 
                duration: 2,
                delay: 1.3
              }
            }
          }}
        />
        
        {/* ETH Token */}
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-uniswap-blue z-20"
          initial="initial"
          animate={controls}
          variants={{
            initial: { x: -150, y: -100, opacity: 0 },
            animate: { 
              x: 0,
              y: 0,
              opacity: [0, 1, 0],
              transition: { 
                duration: 1.2,
                times: [0, 0.8, 1]
              }
            }
          }}
        />
        
        {/* USDC Token */}
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-uniswap-pink z-20"
          initial="initial"
          animate={controls}
          variants={{
            initial: { x: 150, y: -100, opacity: 0 },
            animate: { 
              x: 0,
              y: 0,
              opacity: [0, 1, 0],
              transition: { 
                duration: 1.2,
                times: [0, 0.8, 1]
              }
            }
          }}
        />
        
        {/* Ripple effects */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-uniswap-pink"
            initial="initial"
            animate={controls}
            variants={{
              initial: { width: 32, height: 32, opacity: 0 },
              animate: { 
                width: [32, 200],
                height: [32, 200],
                opacity: [0, 0.4, 0],
                transition: { 
                  delay: 1.5 + (i * 0.4),
                  duration: 2,
                  ease: "easeOut"
                }
              }
            }}
          />
        ))}
        
        {/* Small particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white"
            initial="initial"
            animate={controls}
            variants={{
              initial: { 
                x: 0, 
                y: 0, 
                opacity: 0 
              },
              animate: { 
                x: [0, (Math.sin(i * 30) * 100)],
                y: [0, (Math.cos(i * 30) * 100)],
                opacity: [0, 0.8, 0],
                transition: { 
                  delay: 1.8 + (i * 0.05),
                  duration: 1.2,
                  ease: "easeOut"
                }
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PoolCreationAnimation;