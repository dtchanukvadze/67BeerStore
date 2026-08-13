// src/lib/types/models.ts
import { Tables } from "./db";

// Extend Supabase generated types for specific needs, e.g., joined tables
export type ProductWithCategory = Tables<'products'> & {
  categories: { id: string; name: string } | null;
};

export type Category = Tables<'categories'>;
export type ExpenseCategory = Tables<'expense_categories'>;

// For forms, client-side data
export type ProductFormCombined = Omit<Tables<'products'>, 'id' | 'created_at' | 'updated_at'> & {
  image_file?: FileList; // For file input
};
