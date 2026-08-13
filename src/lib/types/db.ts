export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Business = { id: string; name: string; created_at: string; updated_at: string };
type Category = { id: string; business_id: string; name: string; active: boolean; created_at: string; updated_at: string };
type Product = { id: string; business_id: string; category_id: string | null; name: string; description: string | null; price: number; active: boolean; image_url: string | null; created_at: string; updated_at: string };
type SaleItem = { id: string; sale_id: string; product_id: string; quantity: number; unit_price: number; created_at: string };
type ExpenseCategory = { id: string; business_id: string; name: string; active: boolean; created_at: string; updated_at: string };
type Sale = { id: string; business_id: string; sale_number: number; payment_method: string; total_amount: number; created_at: string };
type Expense = { id: string; business_id: string; category_id: string; amount: number; payment_method: string; description: string | null; expense_date: string; created_at: string };
type DailyClosing = { id: string; business_id: string; closing_date: string; actual_cash: number; expected_cash: number; difference: number; created_at: string };

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.15" };
  public: {
    Tables: {
      businesses: Table<Business, Partial<Business> & { id?: string; name: string }>;
      categories: Table<Category, Partial<Category> & { business_id: string; name: string }>;
      products: Table<Product, Partial<Product> & { business_id: string; name: string; price: number }>;
      sale_items: Table<SaleItem, Partial<SaleItem> & { sale_id: string; product_id: string; quantity: number; unit_price: number }>;
      expense_categories: Table<ExpenseCategory, Partial<ExpenseCategory> & { business_id: string; name: string }>;
      sales: Table<Sale, Partial<Sale> & { business_id: string; payment_method: string; total_amount: number }>;
      expenses: Table<Expense, Partial<Expense> & { business_id: string; category_id: string; amount: number; payment_method: string }>;
      daily_closings: Table<DailyClosing, Partial<DailyClosing> & { business_id: string; closing_date: string; actual_cash: number; expected_cash: number; difference: number }>;
    };
    Views: Record<never, never>;
    Functions: { create_sale_transaction: { Args: { p_business_id: string; p_payment_method: string; p_cart_items: Json }; Returns: { sale_id: string; sale_number: string | number; total_amount: number }[]; }; };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
