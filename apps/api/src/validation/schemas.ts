import { z, ZodError } from "zod";

const hexString = z.string().regex(/^0x[0-9a-fA-F]*$/, "must be a hex string");
const addressString = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "must be a valid 20-byte address");

export const eip7702PlanRequestSchema = z.object({
  sender: addressString,
  chainId: z.number().int().positive(),
  delegateTo: addressString.optional(),
  calldata: hexString.optional(),
});

export const eip7702SubmitRequestSchema = z
  .object({
    executionId: z.string().min(1),
    txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, "must be a transaction hash").optional(),
    signedTx: hexString.optional(),
    txRequestSnapshot: z
      .object({
        from: addressString,
        to: addressString,
        value: hexString,
        data: hexString,
        chainId: hexString,
        nonce: hexString,
        gas: hexString,
        maxFeePerGas: hexString,
        maxPriorityFeePerGas: hexString,
        authorizationList: z.array(
          z.object({
            chainId: hexString,
            address: addressString,
            nonce: hexString,
          })
        ),
      })
      .optional(),
    unsupportedFields: z.array(z.string()).optional(),
  })
  .refine((value) => Boolean(value.txHash || value.signedTx), {
    path: ["txHash"],
    message: "txHash or signedTx is required",
  });

export const permit2BatchPlanRequestSchema = z.object({
  sender: addressString,
  chainId: z.number().int().positive(),
  spender: addressString.optional(),
  permits: z
    .array(
      z.object({
        token: addressString,
        amount: z.string().regex(/^\d+$/, "must be a uint decimal string"),
        expiration: z.number().int().positive().optional(),
      })
    )
    .min(1, "at least one permit is required"),
});

export const permit2BatchSubmitRequestSchema = z.object({
  executionId: z.string().min(1),
  signature: hexString,
});

export function formatValidationError(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",
    message: issue.message,
  }));
}
