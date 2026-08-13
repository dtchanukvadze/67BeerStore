"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserClient } from "@/lib/supabase/client";
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

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("active", true)
          .order("name", {
            ascending: true,
          });

        if (error) {
          console.error("Error fetching categories:", error);

          if (mounted) {
            toast.error("Failed to load categories.");
          }

          return;
        }

        if (mounted) {
          setCategories(data ?? []);
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
  }, [supabase]);

  if (isLoading) {
    return <LoadingSpinner className="h-10" />;
  }

  return (
    <Select
      value={value ?? "none"}
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