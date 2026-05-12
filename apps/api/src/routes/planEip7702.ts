import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  Eip7702PlanRequest,
  Eip7702PlanResponse,
  CONTRACT_ADDRESSES,
} from "@saas-wallet/shared";
import { PublicClient, toHex } from "viem";
import { getPublicClientForChain } from "../config/rpc";
import { storePlannedExecution } from "../store/executionStore";
import { eip7702PlanRequestSchema, formatValidationError } from "../validation/schemas";

const router = Router();

router.post("/plan/eip7702", async (req: Request, res: Response) => {
  const parsed = eip7702PlanRequestSchema.safeParse(req.body as Partial<Eip7702PlanRequest>);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: formatValidationError(parsed.error) });
    return;
  }
  const body = parsed.data;
  const sender = body.sender as `0x${string}`;
  const calldata = (body.calldata ?? "0x") as `0x${string}`;

  const delegateTo = (body.delegateTo ?? CONTRACT_ADDRESSES.EIP7702Module) as `0x${string}`;
  let client: PublicClient;
  try {
    client = getPublicClientForChain(body.chainId);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
    return;
  }

  let nonce = 0n;
  let gas = 100000n;
  let balance = 0n;
  let maxPriorityFeePerGas = 1_000_000_000n;
  let maxFeePerGas = 5_000_000_000n;
  let nonceSource: "rpc" | "fallback" = "fallback";
  let feeSource: "rpc" | "fallback" = "fallback";

  try {
    nonce = BigInt(await client.getTransactionCount({ address: sender, blockTag: "pending" }));
    nonceSource = "rpc";
  } catch {
    nonce = 0n;
  }

  try {
    balance = await client.getBalance({ address: sender });
  } catch {
    balance = 0n;
  }

  try {
    gas = await client.estimateGas({
      account: sender,
      to: sender,
      value: 0n,
      data: calldata,
    });
  } catch {
    gas = 100000n;
  }

  try {
    const fee = await client.estimateFeesPerGas();
    maxPriorityFeePerGas = fee.maxPriorityFeePerGas ?? maxPriorityFeePerGas;
    if (fee.maxFeePerGas) {
      maxFeePerGas = fee.maxFeePerGas;
    } else if (fee.gasPrice) {
      maxFeePerGas = fee.gasPrice + maxPriorityFeePerGas;
    }
    feeSource = "rpc";
  } catch {
    maxPriorityFeePerGas = 1_000_000_000n;
    maxFeePerGas = 5_000_000_000n;
  }

  const chainIdHex = `0x${body.chainId.toString(16)}` as `0x${string}`;
  const executionId = uuidv4();

  const response: Eip7702PlanResponse = {
    executionId,
    txRequest: {
      from: sender,
      to: sender, // EIP-7702: the sender delegates itself
      value: "0x0",
      data: calldata,
      chainId: chainIdHex,
      nonce: toHex(nonce),
      gas: toHex(gas),
      maxFeePerGas: toHex(maxFeePerGas),
      maxPriorityFeePerGas: toHex(maxPriorityFeePerGas),
      authorizationList: [
        {
          chainId: chainIdHex,
          address: delegateTo,
          nonce: toHex(nonce + 1n),
        },
      ],
    },
    planning: {
      balance: toHex(balance),
      nonceSource,
      feeSource,
    },
  };

  storePlannedExecution(executionId, "eip7702", {
    sender,
    chainId: body.chainId,
    balance: toHex(balance),
    txRequest: response.txRequest,
  });

  res.json(response);
});

export default router;
