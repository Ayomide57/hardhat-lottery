import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { assert, expect } from 'chai';
import { Lottery, VRFCoordinatorV2Mock } from "../../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';
import networkConfig, { developmentChains } from '../../helper-hardhat-config'

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", function () {
        let lottery: Lottery;
        let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
        let deployer: SignerWithAddress;
        const chainId: number = network.config.chainId!;
        let lotterEntranceFee: BigNumber;
        let interval: BigNumber;
        let player: SignerWithAddress;
        let lotteryContract: Lottery;
        let subscriptionId: string = networkConfig[chainId]['subscriptionId']!

        beforeEach(async () => {
            const accounts = await ethers.getSigners();
            //deployer = (await getNamedAccounts()).deployer;
            //deployer = accounts[0]
            player = accounts[1]
            await deployments.fixture(["all"])
            //await deployments.fixture(["mocks", "lottery"]) // Deploys modules with the tags "mocks" and "raffle"
            //lottery = await ethers.getContract("Lottery", deployer)
            //vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            lotteryContract = await ethers.getContract("Lottery")
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
            lottery = lotteryContract.connect(player) // Returns a new instance of the Raffle contract connected to player
            lotterEntranceFee = await lottery.getEntranceFee();
            interval = await lottery.getInterval();
            /**if (developmentChains.includes(network.name)) {
                const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
                const transactionReciept = await transactionResponse.wait(1);
                if (transactionReciept && transactionReciept.events && transactionReciept.events[0].args) {
                    console.log("got here")
                    await vrfCoordinatorV2Mock.addConsumer(transactionReciept.events[0].args.subId, lottery.address)
                };
            }**/
        });

        describe("constructor", () => {
            it("sets all arguments for constructor, VRFCoordinatorV2Mock address etc", async () => {
                const lotteryState = await lottery.getLotteryState();
                const numWords = await lottery.getNumWords();
                const requestConfirmation = await lottery.getRequestComfirmation();
                //const interval = await lottery.getInterval();
                assert.equal(lotteryState.toString(), "0");
                assert.equal(interval.toString(), networkConfig[chainId]['interval']);
                assert.equal(numWords.toString(), "1");
                assert.equal(requestConfirmation.toString(), "3");
            });
        });

        describe("enterLottery", () => {
            it("reverts when you don't pay enough", async () => {
                await expect(lottery.enterLottery()).to.be.revertedWithCustomError( // is reverted when not paid enough or raffle is not open
                    lottery,
                    "Lottery__NotEnoughEth"
                )
            });
            it("records players when they enter", async () => {
                await lottery.enterLottery({ value: lotterEntranceFee })
                const playerFromContract = await lottery.getPlayer(0);
                assert.equal(playerFromContract, player.address)
            });
            it("emits an event on enter", async () => {
                await expect(lottery.enterLottery({ value: lotterEntranceFee })).to.emit(
                    lottery,
                    "LotteryEnter"
                )
            });

            it("doesn't allow entrance when lottery is calculating", async () => {
                await lottery.enterLottery({ value: lotterEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                // pretend to be chainlink keepers

                /**await lottery.performUpkeep([]);
                await expect(lottery.enterLottery({ value: lotterEntranceFee })).to.be.revertedWithCustomError(
                     // is reverted when lottery is calculating i.e not opened 
                    lottery,
                    "Lottery__NotOpen"
                )*/
            });

        });

        describe("checkUpkeep", function () {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded)
            })
            it("returns false if raffle isn't open", async () => {
                await lottery.enterLottery({ value: lotterEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                //await lottery.performUpkeep([]) // changes the state to calculating
                const raffleState = await lottery.getLotteryState() // stores the new state
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert.equal(raffleState.toString() == "1", upkeepNeeded == false)
            })
            it("returns false if enough time hasn't passed", async () => {
                await lottery.enterLottery({ value: lotterEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await lottery.enterLottery({ value: lotterEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(upkeepNeeded)
            })
        })

        describe("performUpkeep", function () {
            it("can only run if checkupkeep is true", async () => { 
                await lottery.enterLottery({ value: lotterEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const tx = await lottery.performUpkeep("0x") 
                assert(tx)
            })
        })

    })