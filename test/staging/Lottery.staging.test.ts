import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { assert, expect } from 'chai';
import { Lottery, VRFCoordinatorV2Mock } from "../../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';
import networkConfig, { developmentChains } from '../../helper-hardhat-config'

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", function () {
        let lottery: Lottery;
        let deployer: string;
        const chainId: number = network.config.chainId!;
        let lotterEntranceFee: BigNumber;
        let interval: BigNumber;
        let subscriptionId: string = networkConfig[chainId]['subscriptionId']!

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer;
            lottery = await ethers.getContract("Lottery", deployer)
            lotterEntranceFee = await lottery.getEntranceFee();
            interval = await lottery.getInterval();
        });

        describe("FulfillRandomWords", () => {
            it("works with live chainlinkkeepers anc chainlink VRF, we get a random winner", async () => {
                const startingTimeStamp = await lottery.getLatestTimeStamp();
                const accounts = await ethers.getSigners() 

                await new Promise<void>(async (resolve, reject) => {
                    // setup a listner before we enter raffle
                    // this promise wait for the event WinnerPicked, so once the event is fired the below code will be executed
                    lottery.once("WinnerPicked",async () => {
                        console.log("WinnerPicked event fired!")
                        
                        try {

                            const recentWinner = await lottery.getRecentWinner();
                            const lotteryState = await lottery.getLotteryState();
                            const winnerEndingBalance = await accounts[0].getBalance();
                            const endingTimeStamp = await lottery.getLatestTimeStamp();

                            await expect(lottery.getPlayer(0)).to.be.reverted
                            assert.equal(recentWinner.toString(), accounts[0].address)
                            assert.equal(
                                winnerEndingBalance.toString(),
                                winnerStartingBalance.add(lotterEntranceFee).toString())
                            
                            assert(endingTimeStamp > startingTimeStamp)
                            resolve()
                        } catch (error) {
                            console.log(error)
                            reject(error)
                        }
                    })

                    await lottery.enterLottery({ value: lotterEntranceFee });
                    const winnerStartingBalance = await accounts[0].getBalance();
                });
            });
        });
    });