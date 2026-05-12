import { useNativeBalance } from "../hooks/useNativeBalance";

export function NativeBalance() {
  const { balance, symbol, isLoading, refetch } = useNativeBalance();

  return (
    <div>
      {isLoading ? (
        <p>Loading balance…</p>
      ) : balance !== undefined ? (
        <p>
          <strong>Balance:</strong> {parseFloat(balance).toFixed(6)} {symbol}
        </p>
      ) : (
        <p style={{ color: "#888" }}>Connect wallet to see balance.</p>
      )}
      <button onClick={() => void refetch()} style={{ marginTop: "0.25rem" }}>
        Refresh
      </button>
    </div>
  );
}
