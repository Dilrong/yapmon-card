import { Button } from "../ui/button";
import { useConnect, useDisconnect, useAccount } from "wagmi";

export const WalletConnect = () => {
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <Button onClick={handleWalletAction} disabled={isPending}>
      {isPending
        ? "Connecting..."
        : isConnected
        ? "Disconnect"
        : "Connect Wallet"}
    </Button>
  );
};
