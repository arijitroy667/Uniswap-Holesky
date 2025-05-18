import { ethers } from 'ethers';
import UniswapV2FactoryABI from './abis/UniswapV2Factory.json';
import UniswapV2PairABI from './abis/UniswapV2Pair.json';
import UniswapV2RouterABI from './abis/USDCETHRouter.json';
import WETHABI from './abis/WETH.json';
import ERC20ABI from './abis/ERC20.json';

// Contract addresses on Holesky
const FACTORY_ADDRESS = "0x0135F40aA3b7E8d14ce830d3017B193B9a040bA9"; 
const ROUTER_ADDRESS = "0xC4aAE271Cc64B5802FEbDDFA178f4BCA40FEcfb9";   
const WETH_ADDRESS = "0x94373a4919B3240D86eA41593D5eBa789FEF3848"; 
const USDC_ADDRESS = "0x06901fD3D877db8fC8788242F37c1A15f05CEfF8";

export class UniswapService {
  constructor(provider) {
    this.provider = provider;
  }

async init(){
    try{
    this.signer = await this.provider.getSigner();
    
    // Initialize contract instances
    this.factory = new ethers.Contract(FACTORY_ADDRESS, UniswapV2FactoryABI, this.signer);
    this.router = new ethers.Contract(ROUTER_ADDRESS, UniswapV2RouterABI, this.signer);
    this.weth = new ethers.Contract(WETH_ADDRESS, WETHABI, this.signer);
    this.usdc = new ethers.Contract(USDC_ADDRESS, ERC20ABI, this.signer);
  } catch(error){
    console.error("Error initializing UniswapService:", error);
    throw error;
    }
}

  async getPairAddress() {
    return await this.factory.getPair(WETH_ADDRESS, USDC_ADDRESS);
  }

  async getPairInstance() {
    const pairAddress = await this.getPairAddress();
  // Change ethers.constants.AddressZero to ethers.ZeroAddress
  if (pairAddress === ethers.ZeroAddress) {
    throw new Error("Pair doesn't exist yet. Please create the pair first.");
  }
  return new ethers.Contract(pairAddress, UniswapV2PairABI, this.signer);
}

async createPair() {
    const pairAddress = await this.getPairAddress();
    // Change here too
    if (pairAddress !== ethers.ZeroAddress) {
      return pairAddress; // Pair already exists
    }
    
    const tx = await this.factory.createPair(WETH_ADDRESS, USDC_ADDRESS);
    await tx.wait();
    return await this.getPairAddress();
  }

  async addLiquidity(ethAmount, usdcAmount) {
    // Convert ETH amount to wei
    const ethWei = ethers.parseEther(ethAmount.toString());
    
    // Convert USDC amount based on decimals (usually 6 for USDC)
    const usdcDecimals = await this.usdc.decimals();
    const usdcWei = ethers.parseUnits(usdcAmount.toString(), usdcDecimals);
    
    // Create or get pair
    let pairAddress;
    try {
      pairAddress = await this.getPairAddress();
      if (pairAddress === ethers.ZeroAddress) {
        pairAddress = await this.createPair();
      }
    } catch (error) {
      console.error("Error getting/creating pair:", error);
      throw error;
    }
    
    const pair = new ethers.Contract(pairAddress, UniswapV2PairABI, this.signer);
    
    // 1. Deposit ETH to get WETH
    const wethTx = await this.weth.deposit({ value: ethWei });
    await wethTx.wait();
    
    // 2. Approve pair to spend tokens
    const wethApproveTx = await this.weth.approve(pairAddress, ethWei);
    await wethApproveTx.wait();
    
    const usdcApproveTx = await this.usdc.approve(pairAddress, usdcWei);
    await usdcApproveTx.wait();
    
    // 3. Transfer tokens to pair
    const wethTransferTx = await this.weth.transfer(pairAddress, ethWei);
    await wethTransferTx.wait();
    
    const usdcTransferTx = await this.usdc.transfer(pairAddress, usdcWei);
    await usdcTransferTx.wait();
    
    // 4. Call mint to receive LP tokens
    const signerAddress = await this.signer.getAddress();
    const mintTx = await pair.mint(signerAddress);
    const receipt = await mintTx.wait();
    
    // Get LP token amount from logs
    const lpAmount = await pair.balanceOf(signerAddress);
    return {
      lpAmount: ethers.formatEther(lpAmount),
      txHash: receipt.transactionHash
    };
  }

  async swapETHForUSDC(ethAmount, minUsdcAmount, deadline = 20) {
    // Convert ETH amount to wei
    const ethWei = ethers.parseEther(ethAmount.toString());
    
    // Convert min USDC amount based on decimals (usually 6 for USDC)
    const usdcDecimals = await this.usdc.decimals();
    const minUsdcWei = ethers.parseUnits(minUsdcAmount.toString(), usdcDecimals);
    
    // Set deadline to 20 minutes from now by default
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 60);
    
    // Get signer address
    const signerAddress = await this.signer.getAddress();
    
    // Execute swap
    const tx = await this.router.swapExactETHForUSDC(
      minUsdcWei,
      signerAddress,
      deadlineTimestamp,
      { value: ethWei }
    );
    
    const receipt = await tx.wait();
    
    // Parse swap event to get actual output amount
    const swapEvent = receipt.events.find(event => event.event === 'SwappedETHForUSDC');
    const usdcAmount = swapEvent?.args?.usdcAmount;
    
    return {
      ethAmount,
      usdcAmount: usdcAmount ? ethers.formatUnits(usdcAmount, usdcDecimals) : 'Unknown',
      txHash: receipt.transactionHash
    };
  }

  async swapUSDCForETH(usdcAmount, minEthAmount, deadline = 20) {
    // Convert USDC amount based on decimals
    const usdcDecimals = await this.usdc.decimals();
    const usdcWei = ethers.parseUnits(usdcAmount.toString(), usdcDecimals);
    
    // Convert min ETH amount to wei
    const minEthWei = ethers.parseEther(minEthAmount.toString());
    
    // Set deadline to 20 minutes from now by default
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 60);
    
    // Get signer address
    const signerAddress = await this.signer.getAddress();
    
    // Approve router to spend USDC
    const approveTx = await this.usdc.approve(this.router.address, usdcWei);
    await approveTx.wait();
    
    // Execute swap
    const tx = await this.router.swapExactUSDCForETH(
      usdcWei,
      minEthWei,
      signerAddress,
      deadlineTimestamp
    );
    
    const receipt = await tx.wait();
    
    // Parse swap event to get actual output amount
    let ethAmount;
    try {
        // Get logs from the receipt
        for (const log of receipt.logs) {
          try {
            const parsedLog = this.router.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            
            // Look for the correct event name
            if (parsedLog && parsedLog.name === 'SwappedUSDCForETH') {
              ethAmount = parsedLog.args[2]; // Assuming this is the ETH amount
              break;
            }
          } catch (e) {
            // Skip logs that aren't the event we're looking for
          }
        }
    } catch (e) {
        console.error("Error parsing events:", e);
    }

    return {
      usdcAmount, // The input amount
      ethAmount: ethAmount ? ethers.formatEther(ethAmount) : 'Unknown',
      txHash: receipt.hash
    };
}

  async removeLiquidity(lpAmount, minEthAmount, minUsdcAmount, deadline = 20) {
    // Get pair instance
    const pair = await this.getPairInstance();
    
    // Convert LP amount to wei
    const lpWei = ethers.parseEther(lpAmount.toString());
    
    // Convert min amounts
    const minEthWei = ethers.parseEther(minEthAmount.toString());
    const usdcDecimals = await this.usdc.decimals();
    const minUsdcWei = ethers.parseUnits(minUsdcAmount.toString(), usdcDecimals);
    
    // Set deadline
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 60);
    
    // Get signer address
    const signerAddress = await this.signer.getAddress();
    
    // Approve pair to burn LP tokens
    const approveTx = await pair.approve(pair.address, lpWei);
    await approveTx.wait();
    
    // Transfer LP tokens to the pair contract
    const transferTx = await pair.transfer(pair.address, lpWei);
    await transferTx.wait();
    
    // Call burn to remove liquidity
    const burnTx = await pair.burn(signerAddress);
    const receipt = await burnTx.wait();
    
    // Parse burn event to get removed amounts
    const burnEvent = receipt.events.find(event => event.event === 'Burn');
    const ethRemoved = burnEvent?.args?.amount0 || burnEvent?.args?.amount1;
    const usdcRemoved = burnEvent?.args?.amount1 || burnEvent?.args?.amount0;
    
    return {
      ethAmount: ethers.formatEther(ethRemoved || '0'),
      usdcAmount: ethers.formatUnits(usdcRemoved || '0', usdcDecimals),
      txHash: receipt.transactionHash
    };
  }

  async getReserves() {
    try {

    const pairAddress = await this.getPairAddress();
    
    // If pair doesn't exist yet, return zero reserves instead of throwing
    if (pairAddress === ethers.ZeroAddress) {
      console.log("Liquidity pool doesn't exist yet. Returning zero reserves.");
      return { ethReserve: '0', usdcReserve: '0' };
    }
      const pair = new ethers.Contract(pairAddress, UniswapV2PairABI, this.signer);
      const reserves = await pair.getReserves();
      
      // Determine which token is which in the reserves
      const token0 = await pair.token0();
      
      // Format reserves based on token order
      if (token0.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        return {
          ethReserve: ethers.formatEther(reserves[0]),
          usdcReserve: ethers.formatUnits(reserves[1], await this.usdc.decimals())
        };
      } else {
        return {
          ethReserve: ethers.formatEther(reserves[1]),
          usdcReserve: ethers.formatUnits(reserves[0], await this.usdc.decimals())
        };
      }
    } catch (error) {
      console.error("Error getting reserves:", error);
      return { ethReserve: '0', usdcReserve: '0' };
    }
  }

  async getQuote(inputAmount, isEthToUsdc) {
    try {
      if (isEthToUsdc) {
        const ethWei = ethers.parseEther(inputAmount.toString());
        const usdcWei = await this.router.getUSDCAmountOut(ethWei);
        return ethers.formatUnits(usdcWei, await this.usdc.decimals());
      } else {
        const usdcDecimals = await this.usdc.decimals();
        const usdcWei = ethers.parseUnits(inputAmount.toString(), usdcDecimals);
        const ethWei = await this.router.getETHAmountOut(usdcWei);
        return ethers.formatEther(ethWei);
      }
    } catch (error) {
      console.error("Error getting quote:", error);
      return '0';
    }
  }
}
