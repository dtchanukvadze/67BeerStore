// src/lib/validations/dailyClosing.ts
import { z } from 'zod';
import { ZodCurrencyAmount } from './common';

export const dailyClosingFormSchema = z.object({
  closing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)."),
  actual_cash: ZodCurrencyAmount,
});

export type DailyClosingFormValues = z.infer<typeof dailyClosingFormSchema>;