import { ethers, BigNumber } from "ethers";


export interface networkConfigItem {
  name?: string;
  vrfCoordinatorV2?: string;
  entranceFee: BigNumber;
  gasLane?: string;
  subscriptionId?: string;
  callbackGasLimit?: string;
  interval?: string;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem
}


const networkConfig: networkConfigInfo = {
  5: {
    name: 'goerli',
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "6324",
    callbackGasLimit: "500000",
    interval: "30",
  },
  31337: {
    name: '"hardhat',
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "500000",
    interval: "30",
  }
}

export const developmentChains = ['hardhat', 'localhost'];
export const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is for premium which 0.25 per request in chainlink 
export const GAS_PRICE_LINK =  1e9 // 1e9 = 1000000000 // link per gas. Calculated gas price based on the gas price

 

export default networkConfig;