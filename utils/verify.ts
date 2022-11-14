import { run} from 'hardhat';


const verify = async (contractAddress: string, args: any[]) => {
    console.log("Verifying My Contract ................");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
             console.log("Already Verified")
        } else {
            console.log(error);
         }
    }
}

export default verify; 