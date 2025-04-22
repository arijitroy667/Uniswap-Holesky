import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AnimatePresence, motion } from 'framer-motion';
import { UniswapService } from './contracts/uniswap';
import {
  Header,
  TabNavigation,
  PoolInfo,
  CreatePoolNotice,
  TransactionAlert,
  WelcomeCard,
  Footer,
  AddLiquidityForm,
  SwapForm,
  RemoveLiquidityForm
} from './components';
import { PoolCreationAnimation } from './components/animations';

function App() {
  // Provider state
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [uniswapService, setUniswapService] = useState<UniswapService | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  
  // Balance state
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [lpBalance, setLpBalance] = useState<string>('0');
  const [reserves, setReserves] = useState<{ ethReserve: string, usdcReserve: string }>({ 
    ethReserve: '0', 
    usdcReserve: '0' 
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>('add');
  const [swapDirection, setSwapDirection] = useState<'ethToUsdc' | 'usdcToEth'>('ethToUsdc');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPoolCreation, setShowPoolCreation] = useState<boolean>(false);
  
  // Alert state
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    txHash?: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });
  
  // Error state
  const [error, setError] = useState<string>('');
  
  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check if we're on Holesky
        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(17000)) {
          setError('Please connect to Holesky Testnet');
          return;
        }
        
        // Get signer and address
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Set state
        setProvider(provider);
        setAccount(address);
        
        // Initialize service
        const uniswap = new UniswapService(provider);
        await uniswap.init();
        setUniswapService(uniswap);
        
        // Listen for network changes
        window.ethereum.on('chainChanged', () => window.location.reload());
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            setAccount(null);
          } else {
            window.location.reload();
          }
        });
        
        // Clear any previous errors
        setError('');
      } else {
        setError('Please install MetaMask to use this app');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Error connecting wallet. Please try again.');
    }
  };
  
  // Load user data and pool info
  const loadData = async () => {
    if (!uniswapService || !account || !provider) return;
    
    try {
      // Get ETH balance
      const ethBal = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(ethBal));
      
      // Get USDC balance
      try {
        const usdcContract = uniswapService.usdc;
        if (usdcContract) {
          const usdcBal = await usdcContract.balanceOf(account);
          const usdcDecimals = await usdcContract.decimals();
          setUsdcBalance(ethers.formatUnits(usdcBal, usdcDecimals));
        }
      } catch (error) {
        console.error("Error fetching USDC balance:", error);
      }
      
      // Get LP balance if pair exists
      try {
        const pair = await uniswapService.getPairInstance();
        const lpBal = await pair.balanceOf(account);
        setLpBalance(ethers.formatEther(lpBal));
      } catch (e) {
        // Pair might not exist yet
        setLpBalance('0');
      }
      
      // Get reserves
      try {
        const reserveData = await uniswapService.getReserves();
        setReserves(reserveData);
      } catch (e) {
        // Pool might not exist
        setReserves({ ethReserve: '0', usdcReserve: '0' });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  // Swap quote function
  const getSwapQuote = async (amount: string) => {
    if (!uniswapService || !amount) return '0';
    
    try {
      return await uniswapService.getQuote(amount, swapDirection === 'ethToUsdc');
    } catch (error) {
      console.error('Error getting quote:', error);
      return '0';
    }
  };
  
  // Add liquidity handler
  const handleAddLiquidity = async (ethAmount: string, usdcAmount: string) => {
    if (!uniswapService) return;
    
    setLoading(true);
    setAlertInfo({ show: false, type: 'success', message: '' });
    
    try {
      const isNewPool = parseFloat(reserves.ethReserve) === 0 && parseFloat(reserves.usdcReserve) === 0;
      
      if (isNewPool) {
        setShowPoolCreation(true);
      }
      
      const result = await uniswapService.addLiquidity(ethAmount, usdcAmount);
      
      // Show success alert
      setAlertInfo({
        show: true,
        type: 'success',
        message: isNewPool ? 'New liquidity pool created successfully!' : 'Liquidity added successfully!',
        txHash: result.txHash
      });
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error adding liquidity:', error);
      
      // Show error alert
      setAlertInfo({
        show: true,
        type: 'error',
        message: `Failed to add liquidity: ${error.message}`
      });
    } finally {
      setLoading(false);
      setShowPoolCreation(false);
    }
  };
  
  // Swap handler
  const handleSwap = async (amount: string, minOutput: string) => {
    if (!uniswapService) return;
    
    setLoading(true);
    setAlertInfo({ show: false, type: 'success', message: '' });
    
    try {
      let result;
      
      if (swapDirection === 'ethToUsdc') {
        result = await uniswapService.swapETHForUSDC(amount, minOutput);
      } else {
        result = await uniswapService.swapUSDCForETH(amount, minOutput);
      }
      
      // Show success alert
      setAlertInfo({
        show: true,
        type: 'success',
        message: `Swap completed successfully!`,
        txHash: result.txHash
      });
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error swapping:', error);
      
      // Show error alert
      setAlertInfo({
        show: true,
        type: 'error',
        message: `Failed to swap: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Remove liquidity handler
  const handleRemoveLiquidity = async (lpAmount: string) => {
    if (!uniswapService) return;
    
    setLoading(true);
    setAlertInfo({ show: false, type: 'success', message: '' });
    
    try {
      // Calculate minimum amounts with 5% slippage
      const { ethReserve, usdcReserve } = reserves;
      
      const pair = await uniswapService.getPairInstance();
      const totalSupply = await pair.totalSupply();
      
      const lpShare = parseFloat(lpAmount) / parseFloat(ethers.formatEther(totalSupply));
      const minEthAmount = (parseFloat(ethReserve) * lpShare * 0.95).toString();
      const minUsdcAmount = (parseFloat(usdcReserve) * lpShare * 0.95).toString();
      
      const result = await uniswapService.removeLiquidity(
        lpAmount, 
        minEthAmount, 
        minUsdcAmount
      );
      
      // Show success alert
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Liquidity removed successfully!',
        txHash: result.txHash
      });
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error removing liquidity:', error);
      
      // Show error alert
      setAlertInfo({
        show: true,
        type: 'error',
        message: `Failed to remove liquidity: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Create pool shortcut handler
  const handleCreatePool = () => {
    setActiveTab('add');
    // Set initial values (user can adjust)
    setTimeout(() => {
      const poolCreationEl = document.querySelector('.action-card');
      if (poolCreationEl) {
        poolCreationEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Load data when wallet connected
  useEffect(() => {
    if (uniswapService && account && provider) {
      loadData();
      
      // Set interval to refresh data every 30 seconds
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [uniswapService, account, provider]);
  
  // Bounce animation for the main content
  const mainContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow px-4 py-6 md:container md:mx-auto max-w-4xl">
        <Header
          account={account}
          ethBalance={ethBalance}
          usdcBalance={usdcBalance}
          lpBalance={lpBalance}
          onConnectWallet={connectWallet}
        />
        
        {account ? (
          <motion.div 
            className="mt-8"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
          >
            <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
            
            <PoolInfo ethReserve={reserves.ethReserve} usdcReserve={reserves.usdcReserve} />
            
            {account && 
             parseFloat(reserves.ethReserve) === 0 && 
             parseFloat(reserves.usdcReserve) === 0 &&
             activeTab !== 'add' && (
              <CreatePoolNotice onClick={handleCreatePool} />
            )}
            
            {showPoolCreation && (
              <div className="mb-6">
                <PoolCreationAnimation 
                  animate={showPoolCreation} 
                  onComplete={() => setShowPoolCreation(false)} 
                />
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {alertInfo.show && (
                <TransactionAlert
                  type={alertInfo.type}
                  message={alertInfo.message}
                  txHash={alertInfo.txHash}
                  onDismiss={() => setAlertInfo({ ...alertInfo, show: false })}
                />
              )}
            </AnimatePresence>
            
            <motion.div 
              className="card action-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {activeTab === 'add' && (
                  <AddLiquidityForm
                    key="add-liquidity"
                    ethBalance={ethBalance}
                    usdcBalance={usdcBalance}
                    ethReserve={reserves.ethReserve}
                    usdcReserve={reserves.usdcReserve}
                    loading={loading}
                    onSubmit={handleAddLiquidity}
                  />
                )}
                
                {activeTab === 'swap' && (
                  <SwapForm
                    key="swap"
                    ethBalance={ethBalance}
                    usdcBalance={usdcBalance}
                    swapDirection={swapDirection}
                    onDirectionChange={setSwapDirection}
                    getSwapQuote={getSwapQuote}
                    loading={loading}
                    onSubmit={handleSwap}
                  />
                )}
                
                {activeTab === 'remove' && (
                  <RemoveLiquidityForm
                    key="remove-liquidity"
                    lpBalance={lpBalance}
                    ethReserve={reserves.ethReserve}
                    usdcReserve={reserves.usdcReserve}
                    loading={loading}
                    onSubmit={handleRemoveLiquidity}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            
            <Footer 
              factoryAddress={uniswapService?.factory?.target as string}
              routerAddress={uniswapService?.router?.target as string}
            />
          </motion.div>
        ) : (
          <WelcomeCard onConnectWallet={connectWallet} error={error} />
        )}
      </div>
    </div>
  );
}

export default App;