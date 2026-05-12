import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  Eip7702PlanRequest,
  Eip7702PlanResponse,
  CONTRACT_ADDRESSES,
} from "@saas-wallet/shared";

const router = Router();

router.post("/plan/eip7702", (req: Request, res: Response) => {
  const body = req.body as Partial<Eip7702PlanRequest>;

  // --- Basic validation ---
  if (!body.sender || !body.chainId) {
    res.status(400).json({ error: "sender and chainId are required" });
    return;
  }

  const delegateTo = body.delegateTo ?? (CONTRACT_ADDRESSES.EIP7702Module as `0x${string}`);

  // TODO: Replace with real nonce fetch from RPC node
  const nonce = "0x0";
  // TODO: Replace with real gas estimation
  const gas = "0x186A0"; // 100_000
  // TODO: Fetch real base fee from the chain
  const maxFeePerGas = "0x12A05F200"; // 5 gwei
  const maxPriorityFeePerGas = "0x3B9ACA00"; // 1 gwei

  const chainIdHex = `0x${body.chainId.toString(16)}` as `0x${string}`;

  const response: Eip7702PlanResponse = {
    executionId: uuidv4(),
    txRequest: {
      from: body.sender,
      to: body.sender, // EIP-7702: the sender delegates itself
      value: "0x0",
      data: body.calldata ?? "0x",
      chainId: chainIdHex,
      nonce,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      authorizationList: [
        {
          chainId: chainIdHex,
          address: delegateTo,
          nonce: "0x1",
        },
      ],
    },
  };

  // TODO: Persist executionId to DB or in-memory store for submission tracking

  res.json(response);
});

export default router;
