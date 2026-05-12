import { useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { useApiClient } from "../hooks/useApiClient";
import { StatusPanel } from "./StatusPanel";
import type { Eip7702PlanResponse, Eip7702TxRequest } from "@saas-wallet/shared";

export function Eip7702Form() {
  const { address, chainId, isConnected } = useAccount();
  const { planEip7702, submitEip7702 } = useApiClient();
  const { sendTransactionAsync } = useSendTransaction();

  const [calldata, setCalldata] = useState("0x");
  const [planResult, setPlanResult] = useState<Eip7702PlanResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePlan() {
    if (!address || !chainId) return;
    setError(null);
    setLoading(true);
    try {
      const plan = await planEip7702({ sender: address, chainId, calldata }) as Eip7702PlanResponse;
      setPlanResult(plan);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!planResult) return;
    setError(null);
    setLoading(true);
    try {
      const tx = planResult.txRequest as Eip7702TxRequest;
      // Send through wallet — wallet handles signing
      const txHash = await sendTransactionAsync({
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value),
        chainId: parseInt(tx.chainId, 16),
      });
      const result = await submitEip7702({ executionId: planResult.executionId, txHash });
      setSubmitResult(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) return <p style={{ color: "#888" }}>Connect wallet to use EIP-7702.</p>;

  return (
    <div>
      <label>
        Calldata:{" "}
        <input
          value={calldata}
          onChange={(e) => setCalldata(e.target.value)}
          style={{ width: "100%", fontFamily: "monospace" }}
          placeholder="0x"
        />
      </label>
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={() => void handlePlan()} disabled={loading}>
          {loading ? "Planning…" : "Plan EIP-7702"}
        </button>
        <button onClick={() => void handleSubmit()} disabled={loading || !planResult}>
          Sign & Submit
        </button>
      </div>
      <StatusPanel title="Plan" result={planResult} error={error} />
      <StatusPanel title="Submit" result={submitResult} />
    </div>
  );
}
