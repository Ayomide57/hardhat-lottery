import 'dotenv/config';
import { ethers, network } from 'hardhat';
import fs from "fs";

const FRONTEND_ADDRESS_FILE = "../hardhat-lottery-frontend/constants/contractAddresses.json";
const FRONTEND_ABI_FILE = "../hardhat-lottery-frontend/constants/abi.json"


const UpdateFrontend = async () => {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Updating frontend");
        updateContractAddresses();
        updateAbi();
    }
}

async function updateAbi() {
    const lottery = await ethers.getContract("Lottery");
    const lotteryAbi: any = lottery.interface.format(ethers.utils.FormatTypes.json);
    fs.writeFileSync(FRONTEND_ABI_FILE, lotteryAbi)
}


async function updateContractAddresses() {
    const lottery = await ethers.getContract("Lottery");
    const contractAddresses = JSON.parse(fs.readFileSync(FRONTEND_ADDRESS_FILE, "utf8"))
    const chainId: string = network.config.chainId?.toString()!;

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId].includes(lottery.address)) {
            contractAddresses[chainId].push(lottery.address)
        }
    }
    {
        contractAddresses[chainId] = [lottery.address]
    }
    fs.writeFileSync(FRONTEND_ADDRESS_FILE, JSON.stringify(contractAddresses))
}


export default UpdateFrontend;


