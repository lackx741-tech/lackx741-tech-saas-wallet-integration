import { useSwitchChain, useAccount } from "wagmi";
import { SUPPORTED_CHAINS } from "@saas-wallet/shared";

export function ChainSwitcher() {
  const { chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  return (
    <div>
      <p>
        <strong>Current chain:</strong> {chainId ?? "unknown"}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {SUPPORTED_CHAINS.map((chain) => (
          <button
            key={chain.id}
            disabled={isPending || chainId === chain.id}
            onClick={() => switchChain({ chainId: chain.id })}
            style={{
              opacity: chainId === chain.id ? 0.5 : 1,
            }}
          >
            {chain.name}
          </button>
        ))}
      </div>
    </div>
  );
}
