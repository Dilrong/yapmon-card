import { useAccount, useReadContract } from "wagmi";
import YapmonCardsABI from "../../contracts/YapmonCards.json";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

const useNFTUris = (address?: string) => {
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: YapmonCardsABI.abi,
    functionName: "balanceOf",
    args: [address],
  });

  const tokenIds = balance
    ? Array.from({ length: Number(balance) }, (_, i) => BigInt(i))
    : [];
  const nftUris = tokenIds.map((tokenId) =>
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: YapmonCardsABI.abi,
      functionName: "tokenURI",
      args: [tokenId],
    })
  );

  return { balance, nftUris };
};

export const NFTList = () => {
  const { address } = useAccount();
  const { balance, nftUris } = useNFTUris(address);

  if (!address || !balance || balance === 0n) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">Your Yapmon Cards</h2>
        <p>No NFTs owned yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Your Yapmon Cards</h2>
      <div className="grid gap-4">
        {nftUris.map((uri, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Token #{index}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{uri.data || "Loading..."}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
