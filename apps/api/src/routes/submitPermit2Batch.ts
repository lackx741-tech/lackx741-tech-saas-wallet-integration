import { Router, Request, Response } from "express";
import {
  Permit2BatchSubmitRequest,
  ExecutionStatus,
} from "@saas-wallet/shared";
import { keccak256, verifyTypedData } from "viem";
import { getExecution, markExecutionSubmitted } from "../store/executionStore";
import { formatValidationError, permit2BatchSubmitRequestSchema } from "../validation/schemas";

const router = Router();

router.post("/submit/permit2-batch", async (req: Request, res: Response) => {
  const parsed = permit2BatchSubmitRequestSchema.safeParse(req.body as Partial<Permit2BatchSubmitRequest>);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: formatValidationError(parsed.error) });
    return;
  }
  const body = parsed.data;

  const execution = getExecution(body.executionId);
  if (!execution || execution.flow !== "permit2-batch") {
    res.status(404).json({ error: "Unknown executionId for Permit2 batch flow" });
    return;
  }

  const plan = execution.plan as {
    sender: `0x${string}`;
    typedData: {
      domain: { name: string; chainId: number; verifyingContract: `0x${string}` };
      types: Record<string, Array<{ name: string; type: string }>>;
      primaryType: string;
      message: Record<string, unknown>;
    };
  };

  const isValidSignature = await verifyTypedData({
    address: plan.sender,
    domain: plan.typedData.domain,
    types: plan.typedData.types as Record<string, readonly { name: string; type: string }[]>,
    primaryType: plan.typedData.primaryType,
    message: plan.typedData.message,
    signature: body.signature as `0x${string}`,
  });

  if (!isValidSignature) {
    res.status(400).json({ error: "Invalid signature for stored Permit2 typed data" });
    return;
  }

  const status = markExecutionSubmitted(body.executionId, {
    txHash: keccak256(body.signature as `0x${string}`),
    submission: { signature: body.signature },
    message: "Permit2 batch accepted and marked submitted (mock relay).",
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
