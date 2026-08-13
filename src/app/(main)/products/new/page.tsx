// src/app/products/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductFormValues } from '@/lib/validations/product';
import ProductForm from '@/components/products/ProductForm';
import { toast } from 'sonner';

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', data.price.toString());
      formData.append('category_id', data.category_id || '');
      formData.append('active', data.active.toString());

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-50 mb-6">ADD BEER</h1>
      <div className="max-w-xl mx-auto p-6 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
        <ProductForm onSubmit={onSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
