// src/lib/validations/sale.ts
import { z } from 'zod';
import { ZodUUID, ZodCurrencyAmount } from './common';

export const saleItemSchema = z.object({
  product_id: ZodUUID,
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
  unit_price: ZodCurrencyAmount,
});

export const completeSaleSchema = z.object({
  business_id: ZodUUID,
  payment_method: z.enum(['cash', 'card', 'bank_transfer'], { // required_error goes here
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: "Payment method is required." };
      }
      return { message: ctx.defaultError };
    },
  }),
  cart_items: z.array(saleItemSchema).min(1, "Cart cannot be empty."),
});

export type SaleItem = z.infer<typeof saleItemSchema>;
export type CompleteSaleFormValues = z.infer<typeof completeSaleSchema>;