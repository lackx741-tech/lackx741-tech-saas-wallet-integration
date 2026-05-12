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
  const [history, setHistory] = useState<Array<{ step: string; at: string; payload: unknown }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePlan() {
    if (!address || !chainId) return;
    setError(null);
    setLoading(true);
    try {
      const plan = await planEip7702({ sender: address, chainId, calldata }) as Eip7702PlanResponse;
      setPlanResult(plan);
      setHistory((prev) => [{ step: "planned", at: new Date().toISOString(), payload: plan }, ...prev].slice(0, 5));
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
        gas: BigInt(tx.gas),
        nonce: Number(BigInt(tx.nonce)),
        maxFeePerGas: BigInt(tx.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
        chainId: parseInt(tx.chainId, 16),
      });
      const result = await submitEip7702({
        executionId: planResult.executionId,
        txHash,
        txRequestSnapshot: tx,
        unsupportedFields: ["authorizationList"],
      });
      setSubmitResult(result);
      setHistory((prev) => [{ step: "submitted", at: new Date().toISOString(), payload: result }, ...prev].slice(0, 5));
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
      <p style={{ color: "#8a6d3b", fontSize: "0.8rem", marginTop: "0.5rem" }}>
        Note: current wallet helper does not expose EIP-7702 authorizationList fields. The backend still stores the full planned transaction for inspection.
      </p>
      <StatusPanel title="Plan" result={planResult} error={error} />
      <StatusPanel title="Submit" result={submitResult} />
      <StatusPanel title="History (latest first)" result={history} />
    </div>
  );
}
