import type { ContractName } from "./addresses";

// ─── Common ──────────────────────────────────────────────────────────────────

export type HexString = `0x${string}`;

export interface ApiError {
  error: string;
  details?: unknown;
}

// ─── GET /config ─────────────────────────────────────────────────────────────

export interface ConfigResponse {
  supportedChainIds: number[];
  contracts: Record<ContractName, HexString>;
}

// ─── POST /api/plan/eip7702 ───────────────────────────────────────────────────

export interface Eip7702PlanRequest {
  /** EOA that will send the type-4 transaction */
  sender: HexString;
  chainId: number;
  /** Target contract to delegate to (defaults to EIP7702Module) */
  delegateTo?: HexString;
  /** Arbitrary calldata to execute after delegation */
  calldata?: HexString;
}

/** Matches the shape expected by eth_sendTransaction / eth_signTransaction */
export interface Eip7702TxRequest {
  from: HexString;
  to: HexString;
  value: HexString;
  data: HexString;
  chainId: HexString;
  nonce: HexString;
  gas: HexString;
  maxFeePerGas: HexString;
  maxPriorityFeePerGas: HexString;
  authorizationList: AuthorizationItem[];
}

export interface AuthorizationItem {
  chainId: HexString;
  address: HexString;
  nonce: HexString;
}

export interface Eip7702PlanResponse {
  executionId: string;
  txRequest: Eip7702TxRequest;
}

// ─── POST /api/submit/eip7702 ─────────────────────────────────────────────────

export interface Eip7702SubmitRequest {
  executionId: string;
  /** Signed transaction hash returned from wallet */
  txHash?: HexString;
  /** Or a raw signed tx blob if the relayer signs it */
  signedTx?: HexString;
}

export interface ExecutionStatus {
  executionId: string;
  status: "pending" | "submitted" | "confirmed" | "failed";
  txHash?: HexString;
  message?: string;
}

// ─── POST /api/plan/permit2-batch ─────────────────────────────────────────────

export interface TokenPermit {
  token: HexString;
  amount: string; // bigint as decimal string
  expiration?: number; // unix timestamp
}

export interface Permit2BatchPlanRequest {
  sender: HexString;
  chainId: number;
  permits: TokenPermit[];
  /** Target contract that will consume the batch approval */
  spender?: HexString;
}

/** EIP-712 typed data structure (subset) */
export interface Eip712TypedData {
  domain: {
    name: string;
    chainId: number;
    verifyingContract: HexString;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
}

export interface Permit2BatchPlanResponse {
  executionId: string;
  typedData: Eip712TypedData;
  /** Deadline (unix timestamp) for the permit batch */
  deadline: number;
}

// ─── POST /api/submit/permit2-batch ───────────────────────────────────────────

export interface Permit2BatchSubmitRequest {
  executionId: string;
  /** EIP-712 signature from the user's wallet */
  signature: HexString;
}
