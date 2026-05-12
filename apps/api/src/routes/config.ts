import { Router } from "express";
import { CONTRACT_ADDRESSES, SUPPORTED_CHAINS, ConfigResponse } from "@saas-wallet/shared";

const router = Router();

router.get("/config", (_req, res) => {
  const response: ConfigResponse = {
    supportedChainIds: SUPPORTED_CHAINS.map((c) => c.id),
    contracts: CONTRACT_ADDRESSES as ConfigResponse["contracts"],
  };
  res.json(response);
});

export default router;
