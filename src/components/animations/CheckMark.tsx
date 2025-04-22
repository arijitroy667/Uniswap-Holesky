import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CheckMarkProps {
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onComplete?: () => void;
}

const CheckMark: React.FC<CheckMarkProps> = ({ 
  animate = true, 
  size = 'md',
  onComplete
}) => {
  // Define size dimensions
  const dimensions = {
    sm: { circle: 40, stroke: 3 },
    md: { circle: 60, stroke: 4 },
    lg: { circle: 80, stroke: 5 },
  };
  
  const { circle, stroke } = dimensions[size];
  
  // Animation variants
  const circleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      }
    }
  };
  
  const checkVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <div className={cn(
      "flex items-center justify-center",
    )}>
      <motion.svg
        width={circle}
        height={circle}
        viewBox={`0 0 ${circle} ${circle}`}
        initial="hidden"
        animate={animate ? "visible" : "hidden"}
        onAnimationComplete={() => onComplete && onComplete()}
      >
        <motion.circle
          cx={circle / 2}
          cy={circle / 2}
          r={(circle / 2) - stroke}
          fill="none"
          stroke="#27AE60"
          strokeWidth={stroke}
          variants={circleVariants}
        />
        <motion.path
          d={`M ${circle * 0.25} ${circle * 0.5} L ${circle * 0.45} ${circle * 0.7} L ${circle * 0.75} ${circle * 0.3}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={checkVariants}
        />
      </motion.svg>
    </div>
  );
};

export default CheckMark;