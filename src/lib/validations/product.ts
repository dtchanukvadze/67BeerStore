// src/lib/validations/product.ts

import { z } from "zod";
import { ZodUUID } from "./common";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name cannot exceed 100 characters."),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),

  price: z
    .number({ invalid_type_error: "Price must be a number." })
    .positive("Price must be greater than 0.")
    .refine(
      (value) => Number.isFinite(value),
      "Price must be a valid number."
    ),

  category_id: ZodUUID.nullable().optional(),

  active: z.boolean(),

  image_file: z
    .any()
    .refine(
      (file) => {
        if (!file || file.length === 0) return true;

        return file[0].size <= MAX_FILE_SIZE;
      },
      "Max image size is 5MB."
    )
    .refine(
      (file) => {
        if (!file || file.length === 0) return true;

        return ACCEPTED_IMAGE_TYPES.includes(file[0].type);
      },
      "Only JPG, PNG, WEBP formats are supported."
    )
    .optional(),

  image_url: z
    .string()
    .url("Invalid image URL format.")
    .nullable()
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export const productUpdateSchema = productFormSchema.partial();
