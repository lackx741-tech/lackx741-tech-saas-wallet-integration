import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";

export function WalletConnector() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      {!isConnected ? (
        <button onClick={() => open()}>Connect Wallet</button>
      ) : (
        <button onClick={() => disconnect()} style={{ background: "#c0392b", color: "#fff" }}>
          Disconnect
        </button>
      )}
    </div>
  );
}
