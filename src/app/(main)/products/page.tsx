// src/app/products/page.tsx
'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import ProductFilterSort from '@/components/products/ProductFilterSort';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { ProductWithCategory } from '@/lib/types/models';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for products and loading
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingProductId, setIsDeletingProductId] = useState<string | null>(null);

  // State for filters, synchronized with URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || null,
    activeStatus: (searchParams.get('activeStatus') as 'true' | 'false' | 'all') || 'all',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  });

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.activeStatus !== 'all') params.set('activeStatus', filters.activeStatus);
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);

    // Update URL params
    router.push(`/products?${params.toString()}`, { scroll: false });

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load beer products.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, router]);


  useEffect(() => {
    const timer = window.setTimeout(() => void fetchProducts(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchProducts]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    setIsDeletingProductId(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully.');
        fetchProducts(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An unexpected error occurred while deleting the product.');
    } finally {
      setIsDeletingProductId(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-50">🍺 Beer Products</h1>
        <Link href="/products/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="mr-2 h-4 w-4" /> ADD BEER
          </Button>
        </Link>
      </div>

      <ProductFilterSort
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {isLoading ? (
        <LoadingSpinner className="min-h-[300px]" />
      ) : products.length === 0 ? (
        <EmptyState title="No beers found" message="Try adjusting your filters or add a new beer." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
              isDeleting={isDeletingProductId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<LoadingSpinner className="min-h-screen" />}><ProductsContent /></Suspense>;
}
