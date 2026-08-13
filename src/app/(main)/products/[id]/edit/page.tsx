// src/app/products/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductFormValues } from '@/lib/validations/product';
import ProductForm from '@/components/products/ProductForm';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { ProductFormCombined, ProductWithCategory } from '@/lib/types/models';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id: productId } = params;
  const router = useRouter();
  const [initialData, setInitialData] = useState<ProductFormCombined | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchBusinessAndProduct() {
      setIsLoading(true);
      // Fetch business ID
      const { data: businessData, error: businessError } = await supabase.from('businesses').select('id').single();
      if (businessError || !businessData) {
        console.error('Error fetching business ID:', businessError);
        toast.error('Failed to load business information.');
        setIsLoading(false);
        return;
      }
      setBusinessId(businessData.id);

      // Fetch product data
      const response = await fetch(`/api/products/${productId}?businessId=${businessData.id}`);
      if (response.ok) {
        const productData: ProductWithCategory = await response.json();
        setInitialData({
          ...productData,
          price: Number(productData.price), // Convert NUMERIC to number
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to load product for editing.');
      }
      setIsLoading(false);
    }

    if (productId) {
      fetchBusinessAndProduct();
    }
  }, [productId, supabase]);


  const onSubmit = async (data: ProductFormValues) => {
    if (!businessId) {
      toast.error('Business ID not found. Cannot update product.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', data.price.toString());
      formData.append('category_id', data.category_id || '');
      formData.append('active', data.active.toString());
      formData.append('business_id', businessId); // Pass businessId

      // Crucially, pass the existing image_url to the API to determine if old image needs deletion
      formData.append('existing_image_url', initialData?.image_url || '');

      if (data.image_file && data.image_file.length > 0) {
        formData.append('image_file', data.image_file[0]);
      } else if (!data.image_url && initialData?.image_url) {
        // If initialData had an image but current form data has no image_url, it means user removed it
        formData.append('remove_image', 'true');
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData, // Use FormData for file uploads
      });

      if (response.ok) {
        toast.success('✓ Product updated successfully!');
        router.push('/products');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update product.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="min-h-[calc(100vh-120px)]" />;
  }

  if (!initialData) {
    return <EmptyState title="Product Not Found" message="The beer product you are looking for does not exist." />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-50 mb-6">EDIT BEER</h1>
      <div className="max-w-xl mx-auto p-6 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
        <ProductForm initialData={initialData} onSubmit={onSubmit} isLoading={isSubmitting} businessId={businessId!} />
      </div>
    </div>
  );
}