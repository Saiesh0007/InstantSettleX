import { Contract, parseEther } from "ethers"
import { getSigner } from "./provider"
import { settlementAddress } from "./contracts"
import { settlementABI } from "./abi"

export const createTrade = async (
    buyer: string,
    seller: string,
    stockToken: string,
    quantity: number,
    price: number
) => {

    const signer = await getSigner()

    const contract = new Contract(
        settlementAddress,
        settlementABI,
        signer
    )

    const tx = await contract.createTrade(
        buyer,
        seller,
        stockToken,
        quantity,
        parseEther(price.toString())
    )

    const receipt = await tx.wait()

    return receipt.hash
}