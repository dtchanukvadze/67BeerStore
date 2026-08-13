// src/components/products/ProductFilterSort.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/client';
import { Category } from '@/lib/types/models';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProductFilterSortProps {
  businessId: string;
  onFilterChange: (filters: {
    search: string;
    categoryId: string | null;
    activeStatus: 'true' | 'false' | 'all';
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => void;
  initialFilters?: {
    search?: string;
    categoryId?: string | null;
    activeStatus?: 'true' | 'false' | 'all';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export default function ProductFilterSort({
  businessId,
  onFilterChange,
  initialFilters,
}: ProductFilterSortProps) {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialFilters?.categoryId || null
  );
  const [activeStatus, setActiveStatus] = useState<'true' | 'false' | 'all'>(
    initialFilters?.activeStatus || 'all'
  );
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    initialFilters?.sortOrder || 'asc'
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', businessId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories for filter:', error);
        toast.error('Failed to load categories for filtering.');
      } else {
        setCategories(data || []);
      }
      setIsLoadingCategories(false);
    }

    if (businessId) {
      fetchCategories();
    }
  }, [businessId, supabase]);

  const applyFilters = () => {
    onFilterChange({
      search,
      categoryId: selectedCategoryId === '' ? null : selectedCategoryId,
      activeStatus,
      sortBy,
      sortOrder,
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg bg-gray-800 border border-gray-700 shadow-md mb-6">
      <div className="flex-1 min-w-[180px] sm:min-w-[200px]">
        <Input
          placeholder="Search beers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyFilters();
          }}
          className="bg-gray-700 border-gray-600 text-gray-50 focus:border-amber-500"
        />
      </div>

      <div className="min-w-[150px] sm:min-w-[180px]">
        {isLoadingCategories ? (
          <LoadingSpinner className="h-10" />
        ) : (
          <Select
            value={selectedCategoryId || ''}
            onValueChange={(value) => setSelectedCategoryId(value || null)}
          >
            <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="min-w-[100px]">
        <Select value={activeStatus} onValueChange={(value) => value && setActiveStatus(value as 'true' | 'false' | 'all')}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px] sm:min-w-[180px]">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value ?? 'name')}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-50">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="created_at">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[100px]">
        <Select value={sortOrder} onValueChange={(value) => value && setSortOrder(value as 'asc' | 'desc')}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-50">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={applyFilters} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
        Apply Filters
      </Button>
    </div>
  );
}
