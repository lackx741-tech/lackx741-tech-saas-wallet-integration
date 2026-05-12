import { Router, Request, Response } from "express";
import {
  Eip7702SubmitRequest,
  ExecutionStatus,
} from "@saas-wallet/shared";
import { keccak256 } from "viem";
import { eip7702SubmitRequestSchema, formatValidationError } from "../validation/schemas";
import { getExecution, markExecutionSubmitted } from "../store/executionStore";
import { submitRateLimit } from "../middleware/rateLimit";

const router = Router();

router.post("/submit/eip7702", submitRateLimit, (req: Request, res: Response) => {
  const parsed = eip7702SubmitRequestSchema.safeParse(req.body as Partial<Eip7702SubmitRequest>);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: formatValidationError(parsed.error) });
    return;
  }
  const body = parsed.data;

  const execution = getExecution(body.executionId);
  if (!execution || execution.flow !== "eip7702") {
    res.status(404).json({ error: "Unknown executionId for EIP-7702 flow" });
    return;
  }

  if (!body.txHash && !body.signedTx) {
    res.status(400).json({ error: "txHash or signedTx is required" });
    return;
  }

  const txHash =
    (body.txHash as `0x${string}` | undefined) ??
    keccak256(body.signedTx as `0x${string}`);
  const status = markExecutionSubmitted(body.executionId, {
    txHash,
    submission: {
      txHash: body.txHash,
      signedTxProvided: Boolean(body.signedTx),
      txRequestSnapshot: body.txRequestSnapshot,
      unsupportedFields: body.unsupportedFields ?? [],
    },
    message:
      body.unsupportedFields && body.unsupportedFields.length > 0
        ? `Transaction submitted with unsupported wallet fields: ${body.unsupportedFields.join(", ")}`
        : "Transaction submitted (mock relay).",
  });

  res.json(
    (status ?? {
      executionId: body.executionId,
      status: "failed",
      message: "Could not update execution status",
    }) satisfies ExecutionStatus
  );
});

export default router;
