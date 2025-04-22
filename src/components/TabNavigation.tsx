import React from 'react';
import { motion } from 'framer-motion';

interface TabNavigationProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onChange }) => {
  // Animation variants for the active indicator
  const indicatorVariants = {
    add: { x: '0%' },
    swap: { x: '100%' },
    remove: { x: '200%' },
  };
  
  return (
    <div className="relative glassmorphism rounded-xl mb-6 p-1 grid grid-cols-3 gap-1">
      <motion.div 
        className="absolute inset-y-1 w-1/3 bg-uniswap-gray bg-opacity-30 rounded-lg z-0"
        variants={indicatorVariants}
        initial={false}
        animate={activeTab}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      
      <TabButton
        active={activeTab === 'add'}
        onClick={() => onChange('add')}
        icon="+"
        label="Add Liquidity"
      />
      
      <TabButton
        active={activeTab === 'swap'}
        onClick={() => onChange('swap')}
        icon="↔"
        label="Swap"
      />
      
      <TabButton
        active={activeTab === 'remove'}
        onClick={() => onChange('remove')}
        icon="-"
        label="Remove Liquidity"
      />
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <motion.button
      className="relative py-3 text-sm font-medium z-10 rounded-lg transition-colors"
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={`${active ? 'text-uniswap-pink' : 'text-uniswap-light-gray'}`}>
        <span className="mr-1">{icon}</span>
        {label}
      </span>
    </motion.button>
  );
};

export default TabNavigation;