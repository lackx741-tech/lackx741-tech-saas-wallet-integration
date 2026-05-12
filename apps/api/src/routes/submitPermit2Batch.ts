import { Router, Request, Response } from "express";
import {
  Permit2BatchSubmitRequest,
  ExecutionStatus,
} from "@saas-wallet/shared";

const router = Router();

router.post("/submit/permit2-batch", (req: Request, res: Response) => {
  const body = req.body as Partial<Permit2BatchSubmitRequest>;

  if (!body.executionId || !body.signature) {
    res.status(400).json({ error: "executionId and signature are required" });
    return;
  }

  // TODO: Retrieve planned typed data by executionId from store
  // TODO: Validate signature against stored typedData using ecrecover / viem verifyTypedData
  // TODO: Call Permit2Executor contract (via relayer wallet) with the permit batch + signature
  // TODO: Monitor and return real tx status

  const status: ExecutionStatus = {
    executionId: body.executionId,
    status: "submitted",
    txHash: ("0x" + "0".repeat(64)) as `0x${string}`,
    message: "Permit2 batch submitted (mock). Replace with real relayer logic.",
  };

  res.json(status);
});

export default router;
