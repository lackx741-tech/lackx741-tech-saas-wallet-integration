import { Router, Request, Response } from "express";
import {
  Eip7702SubmitRequest,
  ExecutionStatus,
} from "@saas-wallet/shared";

const router = Router();

router.post("/submit/eip7702", (req: Request, res: Response) => {
  const body = req.body as Partial<Eip7702SubmitRequest>;

  if (!body.executionId) {
    res.status(400).json({ error: "executionId is required" });
    return;
  }

  if (!body.txHash && !body.signedTx) {
    res.status(400).json({ error: "txHash or signedTx is required" });
    return;
  }

  // TODO: Validate executionId exists in store
  // TODO: If signedTx provided, broadcast via ethers/viem to RPC node
  // TODO: If txHash provided, just record and monitor confirmations
  // TODO: Implement signature/authorization verification

  const status: ExecutionStatus = {
    executionId: body.executionId,
    status: "submitted",
    txHash: body.txHash ?? ("0x" + "0".repeat(64) as `0x${string}`),
    message: "Transaction submitted (mock). Replace with real relay logic.",
  };

  res.json(status);
});

export default router;
