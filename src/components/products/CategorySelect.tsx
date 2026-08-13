"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types/models";
import { toast } from "sonner";
import LoadingSpinner from "../common/LoadingSpinner";

interface CategorySelectProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export default function CategorySelect({
  value,
  onChange,
  disabled = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/categories?active=true");

        if (!response.ok) {
          console.error("Error fetching categories:", await response.text());

          if (mounted) {
            toast.error("Failed to load categories.");
          }

          return;
        }

        if (mounted) {
          setCategories(await response.json());
        }
      } catch (error) {
        console.error("Unexpected category error:", error);

        if (mounted) {
          toast.error("Failed to load categories.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner className="h-10" />;
  }

  return (
    <Select
      value={value ?? "none"}
      items={[
        { value: "none", label: "No Category" },
        ...categories.map((category) => ({ value: category.id, label: category.name })),
      ]}
      onValueChange={(newValue) => {
        if (newValue === "none") {
          onChange(null);
        } else {
          onChange(newValue);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="none">
          No Category
        </SelectItem>

        {categories.map((category) => (
          <SelectItem
            key={category.id}
            value={category.id}
          >
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
