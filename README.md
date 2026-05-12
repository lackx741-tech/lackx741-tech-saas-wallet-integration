# # SaaS Wallet Integration

A production-oriented scaffold for a SaaS wallet module built with **React + Vite** (frontend) and **Express** (backend).

Designed as a standalone integration that can later be merged into a larger SaaS product.

---

## Repository Layout

```
.
├── apps/
│   ├── api/          Express backend — planning & submission API
│   └── web/          React + Vite frontend — wallet dashboard
├── packages/
│   └── shared/       Shared TypeScript types, addresses, and chain metadata
├── package.json      npm workspace root
└── tsconfig.base.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (npm workspaces support)

---

## Quick Start

### 1. Install dependencies (from repo root)

```bash
npm install
```

### 2. Configure environment variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

The default values work for local development. The WalletConnect Project ID is already pre-filled in the frontend env example.

### 3. Run frontend + backend concurrently

```bash
npm run dev
```

Or run them individually:

```bash
# Terminal 1 — API (http://localhost:3001)
npm run dev -w apps/api

# Terminal 2 — Web (http://localhost:5173)
npm run dev -w apps/web
```

### 4. Build everything

```bash
npm run build
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/config` | Returns supported chains and contract addresses |
| POST | `/api/plan/eip7702` | Plan an EIP-7702 type-4 transaction |
| POST | `/api/submit/eip7702` | Submit a signed EIP-7702 tx |
| POST | `/api/plan/permit2-batch` | Build EIP-712 typed data for a Permit2 batch |
| POST | `/api/submit/permit2-batch` | Submit a signed Permit2 batch permit |

---

## Contract Addresses (shared/src/addresses.ts)

| Name | Address |
|------|---------|
| Factory | `0x653c0bd75e353f1FFeeb8AC9A510ea30F9064ceF` |
| ERC4337FactoryWrapper | `0xC67c4793bDb979A1a4cd97311c7644b4f7a31ff9` |
| Stage1Module | `0xfBC5a55501E747b0c9F82e2866ab2609Fa9b99f4` |
| Stage2Module | `0x5C9C4AD7b287D37a37d267089e752236f368f94f` |
| Guest | `0x2d21Ce2fBe0BAD8022BaE10B5C22eA69fE930Ee6` |
| SessionManager | `0x4AE428352317752a51Ac022C9D2551BcDef785cb` |
| EIP7702Module | `0x1f82E64E694894BACfa441709fC7DD8a30FA3E5d` |
| BatchMulticall | `0xF93E987DF029e95CdE59c0F5cD447e0a7002054D` |
| Permit2Executor | `0x4593D97d6E932648fb4425aC2945adaF66927773` |
| ERC2612Executor | `0xb8eF065061bbBF5dCc65083be8CC7B50121AE900` |
| Permit2 (canonical) | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` |

---

## Scaffold Limitations

- **No real onchain execution.** Planning and submission endpoints return mock payloads and execution IDs.
- **No signature validation.** The backend does not verify EIP-712 or authorization list signatures yet.
- **No nonce/gas fetching.** Nonces, gas limits, and gas prices are hardcoded placeholders.
- **No persistence.** Execution IDs are not stored between requests; add a DB or in-memory store for tracking.
- **No relayer wallet.** The backend has no funded wallet to broadcast transactions.

---

## Next Steps

### Real Permit2 Gasless Flow

1. Install `viem` or `ethers` in `apps/api`.
2. In `planPermit2Batch`, fetch real nonces from the Permit2 contract per-token using `allowance(owner, token, spender).nonce`.
3. In `submitPermit2Batch`, use `viem`'s `verifyTypedData` to validate the signature, then call `Permit2Executor` via a relayer wallet.

### EIP-7702 Relaying

1. In `planEip7702`, fetch the sender's nonce from the RPC and estimate gas.
2. In `submitEip7702`, if receiving `signedTx`, broadcast via `eth_sendRawTransaction`.
3. Implement polling/webhook for confirmation status.

### ERC-4337 Integration

1. Use `@account-abstraction/sdk` or build UserOperation payloads manually.
2. Route UserOps through a bundler (e.g., Pimlico, Alchemy) rather than broadcasting directly.
3. Integrate the `ERC4337FactoryWrapper` for counterfactual account deployment.

### Backend Validation & Security

- Add Zod schema validation for all request bodies.
- Rate-limit planning endpoints.
- Add authentication (JWT or API keys) for production.
- Store secrets (RPC URLs, relayer keys) in a secrets manager, not `.env`.

### Frontend

- Replace inline styles with a component library (e.g., shadcn/ui, Radix).
- Add transaction history / status polling.
- Support ERC-2612 `permit` flow via `ERC2612Executor`.