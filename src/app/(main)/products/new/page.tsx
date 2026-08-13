// src/app/products/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductFormValues } from '@/lib/validations/product';
import ProductForm from '@/components/products/ProductForm';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchBusiness() {
      const { data, error } = await supabase.from('businesses').select('id').single();
      if (error || !data) {
        console.error('Error fetching business ID:', error);
        toast.error('Failed to load business information.');
        // Handle error: maybe redirect to an error page or show a retry option
      } else {
        setBusinessId(data.id);
      }
    }
    fetchBusiness();
  }, [supabase]);


  const onSubmit = async (data: ProductFormValues) => {
    if (!businessId) {
      toast.error('Business ID not found. Cannot add product.');
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

      if (data.image_file && data.image_file.length > 0) {
        formData.append('image_file', data.image_file[0]);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData, // Use FormData for file uploads
      });

      if (response.ok) {
        toast.success('✓ Product added successfully!');
        router.push('/products');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!businessId) {
    return <LoadingSpinner className="min-h-[calc(100vh-120px)]" />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-50 mb-6">ADD BEER</h1>
      <div className="max-w-xl mx-auto p-6 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
        <ProductForm onSubmit={onSubmit} isLoading={isSubmitting} businessId={businessId} />
      </div>
    </div>
  );
}