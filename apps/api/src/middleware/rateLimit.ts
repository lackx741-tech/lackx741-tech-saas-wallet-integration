import rateLimit from "express-rate-limit";

export const submitRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    details: [{ path: "body", message: "Rate limit exceeded. Please retry shortly." }],
  },
});
