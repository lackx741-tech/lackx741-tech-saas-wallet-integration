import { useBalance } from "wagmi";
import { useAccount } from "wagmi";

export function useNativeBalance() {
  const { address, chainId } = useAccount();
  const { data, isLoading, refetch } = useBalance({
    address,
    chainId,
    query: { enabled: !!address },
  });

  return {
    balance: data?.formatted,
    symbol: data?.symbol,
    isLoading,
    refetch,
  };
}
