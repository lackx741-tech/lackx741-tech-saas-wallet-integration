import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, base, arbitrum } from "@reown/appkit/networks";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "5d96428579c2842614d599bb4f8dce0e";

export const networks: [typeof mainnet, typeof base, typeof arbitrum] = [mainnet, base, arbitrum];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata: {
    name: "SaaS Wallet Integration",
    description: "SaaS wallet module — EIP-7702, Permit2, ERC-4337",
    url: typeof window !== "undefined" ? window.location.origin : "https://localhost:5173",
    icons: [],
  },
  features: {
    analytics: false,
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
