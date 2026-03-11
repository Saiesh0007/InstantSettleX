export const switchToSepolia = async () => {
    if (!window.ethereum) {
        alert("MetaMask not installed")
        return
    }

    try {
        // Try switching network
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }] // Sepolia
        })
    } catch (switchError: any) {

        // If network not added, add it
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        chainId: "0xaa36a7",
                        chainName: "Sepolia Test Network",
                        rpcUrls: ["https://rpc.sepolia.org"],
                        nativeCurrency: {
                            name: "Sepolia ETH",
                            symbol: "ETH",
                            decimals: 18
                        },
                        blockExplorerUrls: ["https://sepolia.etherscan.io"]
                    }
                ]
            })
        }
    }
}