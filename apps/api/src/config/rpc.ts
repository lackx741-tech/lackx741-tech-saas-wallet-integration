import { CHAIN_MAP } from "@saas-wallet/shared";
import { Chain, createPublicClient, http, PublicClient } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";

const CHAIN_BY_ID: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
};

const RPC_ENV_BY_CHAIN: Record<number, string> = {
  [mainnet.id]: "ETH_RPC_URL",
  [base.id]: "BASE_RPC_URL",
  [arbitrum.id]: "ARBITRUM_RPC_URL",
};

const clients = new Map<number, PublicClient>();

function resolveRpcUrl(chainId: number): string {
  const envKey = RPC_ENV_BY_CHAIN[chainId];
  const configured = envKey ? process.env[envKey] : undefined;
  if (configured && configured.length > 0) return configured;
  const fallback = CHAIN_MAP[chainId]?.rpcUrls?.[0];
  if (!fallback) {
    throw new Error(`Unsupported chainId ${chainId}`);
  }
  return fallback;
}

export function getPublicClientForChain(chainId: number): PublicClient {
  const existing = clients.get(chainId);
  if (existing) return existing;
  const chain = CHAIN_BY_ID[chainId];
  if (!chain) {
    throw new Error(`Unsupported chainId ${chainId}`);
  }
  const rpcUrl = resolveRpcUrl(chainId);
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  clients.set(chainId, client);
  return client;
}
