import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import YapmonCardsABI from "../../contracts/YapmonCards.json";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

export const MintNFT = () => {
  const { address } = useAccount();
  const [yapScore, setYapScore] = useState<number>(0);
  const { writeContract, isPending, isSuccess, error, data } =
    useWriteContract();

  const mintNFT = () => {
    if (!address) {
      console.log("No address connected");
      toast.error("Please connect your wallet");
      return;
    }

    console.log("Minting NFT with yapScore:", yapScore);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: YapmonCardsABI.abi,
      functionName: "mintYapmon",
      args: [address, BigInt(yapScore)],
      value: parseEther("0.001"),
    });
  };

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(
        `NFT Minted! Tx Hash: ${data.slice(0, 6)}...${data.slice(-4)}`
      );
    }
    if (error) {
      toast.error(`Minting Failed: ${error.message}`);
    }
  }, [isSuccess, error, data]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Mint Your Yapmon Card</h2>
      <Input
        type="number"
        value={yapScore}
        onChange={(e) => setYapScore(Number(e.target.value))}
        placeholder="Enter Yap Score"
        disabled={isPending}
        className="mb-4"
      />
      <Button
        onClick={mintNFT}
        disabled={isPending || !address}
        className="w-full"
      >
        {isPending ? "Minting..." : "Mint NFT"}
      </Button>
    </div>
  );
};
