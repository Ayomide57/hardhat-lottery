import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat"; 
import "hardhat-deploy";

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https//eth-goerli/"
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xkey'
const chainID = 5;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key'; 
const COIN_MARKET_CAP = process.env.COIN_MARKET_CAP || 'key ';



const config: HardhatUserConfig = {
  solidity: {
    compilers: [
        { version: '0.8.17' },
        { version: '0.6.6' }
      ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: chainID
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    player: {
      default: 1,
    }
  },
  gasReporter: {
    enabled: false,
    //outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    //coinmarketcap: COIN_MARKET_CAP, 
  },
  mocha: {
    timeout: 500000, // 500 seconds max for running tests
  },
};

export default config;
