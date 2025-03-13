import { MintNFT } from "./components/feature/MintNFT";
import { WalletConnect } from "./components/feature/WalletConnect";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import { NFTList } from "./components/feature/NFTList";
import { PokemonCard } from "./components/feature/PokemonCard";

const App = () => {
  const { address } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Yapmon Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletConnect />
          {address ? (
            <div className="mt-4 space-y-6">
              <p>
                Connected:{" "}
                <span className="font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </p>
              <Separator />
              <MintNFT />
              <Separator />
              <NFTList />
            </div>
          ) : (
            <p className="mt-4">
              Please connect your wallet to start minting Yapmon Cards!
            </p>
          )}
        </CardContent>
      </Card>
      <PokemonCard />
    </div>
  );
};

export default App;
