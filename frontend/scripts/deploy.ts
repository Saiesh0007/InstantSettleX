import hre from "hardhat"

async function main() {

  const { ethers } = await hre.network.connect()

  const [deployer] = await ethers.getSigners()

  console.log("Deploying with:", deployer.address)

  // Deploy INR token
  const INRToken = await ethers.deployContract("INRToken")
  await INRToken.waitForDeployment()

  const inrAddress = await INRToken.getAddress()
  console.log("INRToken deployed:", inrAddress)

  // Deploy stock token
  const StockToken = await ethers.deployContract(
    "StockToken",
    ["TCS Stock Token", "TCS", "TCS"]
  )

  await StockToken.waitForDeployment()

  const stockAddress = await StockToken.getAddress()
  console.log("StockToken deployed:", stockAddress)

  // Deploy settlement contract
  const Settlement = await ethers.deployContract(
    "AtomicSettlement",
    [inrAddress]
  )

  await Settlement.waitForDeployment()

  const settlementAddress = await Settlement.getAddress()
  console.log("AtomicSettlement deployed:", settlementAddress)

  console.log("\nMinting demo tokens...")

  // Mint INR tokens
  const mintAmount = ethers.parseEther("100000")

  const mintTx = await INRToken.mint(deployer.address, mintAmount)
  await mintTx.wait()

  console.log("INR tokens minted")

  // Mint stock tokens
  const stockMint = ethers.parseEther("1000")

  const mintStockTx = await StockToken.mint(deployer.address, stockMint)
  await mintStockTx.wait()

  console.log("Stock tokens minted")

  console.log("\nApproving settlement contract...")

  // Approve INR
  const approveINR = await INRToken.approve(settlementAddress, mintAmount)
  await approveINR.wait()

  console.log("INR approved")

  // Approve stock
  const approveStock = await StockToken.approve(settlementAddress, stockMint)
  await approveStock.wait()

  console.log("Stock approved")

  console.log("\n--------------------------------")
  console.log("Deployment complete")
  console.log("--------------------------------")

  console.log("INRToken:", inrAddress)
  console.log("StockToken:", stockAddress)
  console.log("AtomicSettlement:", settlementAddress)

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})