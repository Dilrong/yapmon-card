import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({
      target: () => {
        if (window.ethereum?.isRabby) {
          return {
            id: "rabby",
            name: "Rabby Wallet",
            provider: window.ethereum,
            async getProvider() {
              return window.ethereum;
            },
          };
        }
        return {
          id: "metaMask",
          name: "MetaMask",
          provider: window.ethereum,
          async getProvider() {
            return window.ethereum;
          },
        };
      },
    }),
  ],
  transports: {
    [baseSepolia.id]: http(import.meta.env.VITE_BASE_TESTNET_RPC),
  },
});
