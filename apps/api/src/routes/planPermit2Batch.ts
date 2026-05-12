import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  Permit2BatchPlanRequest,
  Permit2BatchPlanResponse,
  CONTRACT_ADDRESSES,
} from "@saas-wallet/shared";
import { keccak256, toHex } from "viem";
import { storePlannedExecution } from "../store/executionStore";
import { formatValidationError, permit2BatchPlanRequestSchema } from "../validation/schemas";

const router = Router();

function derivePermitNonce(executionId: string, index: number): number {
  const hash = keccak256(toHex(`${executionId}:${index}`));
  return parseInt(hash.slice(2, 14), 16);
}

router.post("/plan/permit2-batch", (req: Request, res: Response) => {
  const parsed = permit2BatchPlanRequestSchema.safeParse(req.body as Partial<Permit2BatchPlanRequest>);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: formatValidationError(parsed.error) });
    return;
  }
  const body = parsed.data;

  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const spender = body.spender ?? (CONTRACT_ADDRESSES.Permit2Executor as `0x${string}`);
  const executionId = uuidv4();

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
        nonce: derivePermitNonce(executionId, i),
      })),
      spender,
      sigDeadline: deadline,
    },
  };

  const response: Permit2BatchPlanResponse = {
    executionId,
    typedData,
    deadline,
  };

  storePlannedExecution(executionId, "permit2-batch", {
    sender: body.sender,
    chainId: body.chainId,
    typedData,
    deadline,
  });

  res.json(response);
});

export default router;
