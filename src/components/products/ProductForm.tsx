"use client";

import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validations/product";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import ProductImageUploader from "./ProductImageUploader";
import CategorySelect from "./CategorySelect";

import type { ProductFormCombined } from "@/lib/types/models";

interface ProductFormProps {
  initialData?: ProductFormCombined | null;
  onSubmit: SubmitHandler<ProductFormValues>;
  isLoading: boolean;
  businessId?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),

    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      price:
        initialData?.price !== undefined && initialData?.price !== null
          ? Number(initialData.price)
          : 0,

      category_id: initialData?.category_id ?? null,

      active: initialData?.active ?? true,

      image_url: initialData?.image_url ?? null,

      image_file: undefined,
    },

    mode: "onChange",
  });

  /**
   * Update form when editing an existing product.
   */
  useEffect(() => {
    if (!initialData) {
      return;
    }

    form.reset({
      name: initialData.name ?? "",

      description: initialData.description ?? "",

      price:
        initialData.price !== undefined && initialData.price !== null
          ? Number(initialData.price)
          : 0,

      category_id: initialData.category_id ?? null,

      active: initialData.active ?? true,

      image_url: initialData.image_url ?? null,

      image_file: undefined,
    });
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Product image */}
        <ProductImageUploader
          name="image_file"
          label="Product Photo"
          defaultImageUrl={initialData?.image_url ?? undefined}
          disabled={isLoading}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beer Name</FormLabel>

              <FormControl>
                <Input
                  placeholder="Sanapiro"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>

              <FormControl>
                <CategorySelect
                  value={field.value ?? null}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₾)</FormLabel>

              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="5.00"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value === "") {
                      field.onChange(undefined);
                      return;
                    }

                    const numberValue = Number(value);

                    if (Number.isNaN(numberValue)) {
                      field.onChange(undefined);
                      return;
                    }

                    field.onChange(numberValue);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  disabled={isLoading}
                />
              </FormControl>

              <FormDescription>
                Enter the selling price in Georgian Lari.
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>

              <FormControl>
                <Textarea
                  placeholder="A refreshing Georgian craft beer with a clean and balanced taste."
                  rows={4}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>

              <FormDescription>
                Maximum 500 characters.
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-700 bg-gray-800 p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked === true);
                  }}
                  disabled={isLoading}
                />
              </FormControl>

              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>

                <FormDescription>
                  If inactive, the beer will not appear on the POS
                  sales screen but will remain in product management.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (initialData) {
                form.reset({
                  name: initialData.name ?? "",
                  description: initialData.description ?? "",
                  price:
                    initialData.price !== undefined &&
                    initialData.price !== null
                      ? Number(initialData.price)
                      : 0,
                  category_id: initialData.category_id ?? null,
                  active: initialData.active ?? true,
                  image_url: initialData.image_url ?? null,
                  image_file: undefined,
                });
              } else {
                form.reset();
              }
            }}
            disabled={isLoading}
          >
            Reset
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : initialData
                ? "Save Changes"
                : "Add Beer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
