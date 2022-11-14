import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from "hardhat";
import 'dotenv/config';
import networkConfig, { developmentChains } from '../helper-hardhat-config';
import verify from '../utils/verify';

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; 


const deployLottery: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;
    let VRFCoordinatorV2MockAddress, subscriptionId;

    const entranceFee = networkConfig[chainId]['entranceFee'];
    const gasLane = networkConfig[chainId]['gasLane'];
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    const interval = networkConfig[chainId]["interval"];
    

    // network.name = hardhat/localnetwork
    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2MockAddress = VRFCoordinatorV2Mock.address;

        // you can programmatically get the subscriptionId using the below code and step
        const transactionResponse = await VRFCoordinatorV2Mock.createSubscription();
        const transactionReciept = await transactionResponse.wait(1);
        subscriptionId = transactionReciept.events[0].args.subId;

        // fund the subcription
        //usually, you'd need the link token on a real network
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT )
    } else {
        VRFCoordinatorV2MockAddress = networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }

    const args = [VRFCoordinatorV2MockAddress, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval]
    const lottery = await deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1
    }); 

    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY) {
        await verify(lottery.address, args)
    }

    log('-------------------------------------------------------------------------------------');

}

export default deployLottery;
deployLottery.tags = ["all", "lottery"];
