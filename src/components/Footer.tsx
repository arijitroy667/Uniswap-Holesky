import React from 'react';
import { ExternalLinkIcon } from 'lucide-react';

interface FooterProps {
  factoryAddress?: string;
  routerAddress?: string;
}

const Footer: React.FC<FooterProps> = ({ factoryAddress, routerAddress }) => {
  return (
    <footer className="mt-12 pt-6 border-t border-uniswap-gray border-opacity-20 text-uniswap-light-gray">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <p className="text-xs">
            Factory Address: {factoryAddress || 'Not connected'}
          </p>
          <p className="text-xs">
            Router Address: {routerAddress || 'Not connected'}
          </p>
        </div>
        
        <div className="text-xs">
          <a 
            href="https://holesky.etherscan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-uniswap-pink transition-colors"
          >
            Holesky Etherscan
            <ExternalLinkIcon size={12} className="ml-1" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;