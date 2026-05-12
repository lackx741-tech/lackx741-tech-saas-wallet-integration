/**
 * Supported chain metadata for the SaaS wallet integration.
 */
export interface ChainMeta {
  id: number;
  name: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrl: string;
}

export const SUPPORTED_CHAINS: ChainMeta[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://cloudflare-eth.com"],
    blockExplorerUrl: "https://etherscan.io",
  },
  {
    id: 8453,
    name: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrl: "https://basescan.org",
  },
  {
    id: 42161,
    name: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrl: "https://arbiscan.io",
  },
];

export const CHAIN_MAP: Record<number, ChainMeta> = Object.fromEntries(
  SUPPORTED_CHAINS.map((c) => [c.id, c])
);
