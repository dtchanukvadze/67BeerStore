// src/lib/validations/common.ts
import { z } from 'zod';

export const ZodUUID = z.string().uuid("Invalid UUID format.");
// Use transform for currency to handle string input from forms gracefully if needed
export const ZodCurrencyAmount = z.preprocess(
  (value) => typeof value === "string" ? Number(value) : value,
  z.number().finite("Amount must be a valid number.").min(0, "Amount must be non-negative.")
);
