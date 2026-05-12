import { useAccount } from "wagmi";

export function AccountInfo() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return <p style={{ color: "#888" }}>No wallet connected.</p>;
  }

  return (
    <div>
      <p>
        <strong>Address:</strong>{" "}
        <code style={{ fontSize: "0.85rem" }}>{address}</code>
      </p>
    </div>
  );
}
