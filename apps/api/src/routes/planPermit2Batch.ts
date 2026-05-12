import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  Permit2BatchPlanRequest,
  Permit2BatchPlanResponse,
  CONTRACT_ADDRESSES,
} from "@saas-wallet/shared";

const router = Router();

router.post("/plan/permit2-batch", (req: Request, res: Response) => {
  const body = req.body as Partial<Permit2BatchPlanRequest>;

  if (!body.sender || !body.chainId || !body.permits || !body.permits.length) {
    res.status(400).json({ error: "sender, chainId, and permits[] are required" });
    return;
  }

  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const spender = body.spender ?? (CONTRACT_ADDRESSES.Permit2Executor as `0x${string}`);

  // Build EIP-712 typed data for PermitBatch
  // Matches the Permit2 canonical ABI: https://github.com/Uniswap/permit2
  const typedData: Permit2BatchPlanResponse["typedData"] = {
    domain: {
      name: "Permit2",
      chainId: body.chainId,
      verifyingContract: CONTRACT_ADDRESSES.Permit2 as `0x${string}`,
    },
    types: {
      PermitBatch: [
        { name: "details", type: "PermitDetails[]" },
        { name: "spender", type: "address" },
        { name: "sigDeadline", type: "uint256" },
      ],
      PermitDetails: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint160" },
        { name: "expiration", type: "uint48" },
        { name: "nonce", type: "uint48" },
      ],
    },
    primaryType: "PermitBatch",
    message: {
      details: body.permits.map((p, i) => ({
        token: p.token,
        amount: p.amount,
        expiration: p.expiration ?? deadline,
        nonce: i, // TODO: fetch real nonces from Permit2 contract per token
      })),
      spender,
      sigDeadline: deadline,
    },
  };

  const response: Permit2BatchPlanResponse = {
    executionId: uuidv4(),
    typedData,
    deadline,
  };

  // TODO: Persist executionId + typedData hash for submission verification

  res.json(response);
});

export default router;
