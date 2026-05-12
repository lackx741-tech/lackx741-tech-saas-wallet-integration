import { ExecutionStatus, HexString } from "@saas-wallet/shared";

export type ExecutionFlow = "eip7702" | "permit2-batch";

interface ExecutionRecord {
  executionId: string;
  flow: ExecutionFlow;
  status: ExecutionStatus["status"];
  createdAt: string;
  updatedAt: string;
  plan: unknown;
  txHash?: HexString;
  submission?: unknown;
}

const records = new Map<string, ExecutionRecord>();

export function storePlannedExecution(executionId: string, flow: ExecutionFlow, plan: unknown): ExecutionRecord {
  const now = new Date().toISOString();
  const record: ExecutionRecord = {
    executionId,
    flow,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    plan,
  };
  records.set(executionId, record);
  return record;
}

export function getExecution(executionId: string): ExecutionRecord | undefined {
  return records.get(executionId);
}

export function markExecutionSubmitted(
  executionId: string,
  options: { txHash?: HexString; submission?: unknown; message?: string }
): ExecutionStatus | undefined {
  const existing = records.get(executionId);
  if (!existing) return undefined;
  existing.status = "submitted";
  existing.updatedAt = new Date().toISOString();
  existing.txHash = options.txHash ?? existing.txHash;
  existing.submission = options.submission ?? existing.submission;
  return toExecutionStatus(existing, options.message);
}

export function toExecutionStatus(record: ExecutionRecord, message?: string): ExecutionStatus {
  return {
    executionId: record.executionId,
    status: record.status,
    txHash: record.txHash,
    flow: record.flow,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    message,
  };
}
