import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { useApiClient } from "../hooks/useApiClient";
import { StatusPanel } from "./StatusPanel";
import type { Permit2BatchPlanResponse } from "@saas-wallet/shared";

export function Permit2BatchForm() {
  const { address, chainId, isConnected } = useAccount();
  const { planPermit2Batch, submitPermit2Batch } = useApiClient();
  const { signTypedDataAsync } = useSignTypedData();

  const [token, setToken] = useState("0x");
  const [amount, setAmount] = useState("1000000000000000000");
  const [planResult, setPlanResult] = useState<Permit2BatchPlanResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<unknown>(null);
  const [history, setHistory] = useState<Array<{ step: string; at: string; payload: unknown }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePlan() {
    if (!address || !chainId) return;
    setError(null);
    setLoading(true);
    try {
      const plan = await planPermit2Batch({
        sender: address,
        chainId,
        permits: [{ token, amount }],
      }) as Permit2BatchPlanResponse;
      setPlanResult(plan);
      setHistory((prev) => [{ step: "planned", at: new Date().toISOString(), payload: plan }, ...prev].slice(0, 5));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSign() {
    if (!planResult) return;
    setError(null);
    setLoading(true);
    try {
      const { domain, types, primaryType, message } = planResult.typedData;
      // wagmi's signTypedData expects the EIP-712 structure
      const signature = await signTypedDataAsync({
        domain: {
          ...domain,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract,
        },
        types,
        primaryType,
        message,
      });
      const result = await submitPermit2Batch({
        executionId: planResult.executionId,
        signature,
      });
      setSubmitResult(result);
      setHistory((prev) => [{ step: "submitted", at: new Date().toISOString(), payload: result }, ...prev].slice(0, 5));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) return <p style={{ color: "#888" }}>Connect wallet to use Permit2.</p>;

  return (
    <div>
      <label>
        Token address:{" "}
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ width: "100%", fontFamily: "monospace" }}
          placeholder="0x..."
        />
      </label>
      <label style={{ marginTop: "0.5rem", display: "block" }}>
        Amount (wei):{" "}
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", fontFamily: "monospace" }}
        />
      </label>
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={() => void handlePlan()} disabled={loading}>
          {loading ? "Planning…" : "Plan Permit2 Batch"}
        </button>
        <button onClick={() => void handleSign()} disabled={loading || !planResult}>
          Sign & Submit
        </button>
      </div>
      <StatusPanel title="Plan" result={planResult} error={error} />
      <StatusPanel title="Submit" result={submitResult} />
      <StatusPanel title="History (latest first)" result={history} />
    </div>
  );
}
