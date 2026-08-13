// src/lib/validations/expense.ts
import { z } from 'zod';
import { ZodUUID } from './common';

export const expenseFormSchema = z.object({
  amount: z.preprocess(
    (value) => typeof value === 'string' ? Number(value) : value,
    z.number().finite("Amount must be a valid number.").min(0.01, "Amount must be greater than 0.")
  ),
  category_id: ZodUUID,
  payment_method: z.enum(['cash', 'card', 'bank_transfer'], { // required_error goes here
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: "Payment method is required." };
      }
      return { message: ctx.defaultError };
    },
  }),
  description: z.string().max(500, "Description cannot exceed 500 characters.").optional().or(z.literal('')),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)."),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
