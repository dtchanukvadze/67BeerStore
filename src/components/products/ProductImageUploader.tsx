// src/components/products/ProductImageUploader.tsx
'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils/cn';

interface ProductImageUploaderProps {
  name: string;
  label: string;
  defaultImageUrl?: string | null;
  disabled?: boolean;
}

export default function ProductImageUploader({
  name,
  label,
  defaultImageUrl,
  disabled,
}: ProductImageUploaderProps) {
  const { control, setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Watch the image_file field from the form
  const watchedFile = watch(name);

  const previewUrl = useMemo(() => watchedFile?.length ? URL.createObjectURL(watchedFile[0]) : defaultImageUrl || null, [watchedFile, defaultImageUrl]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setValue(name, files); // Set FileList directly
    } else {
      setValue(name, undefined); // Clear if no file
    }
  }, [name, setValue]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setValue(name, files);
    }
  }, [name, setValue, disabled]);

  const handleRemoveImage = useCallback(() => {
    setValue(name, undefined); // Clear the file input
    // Also clear the actual image_url field if it's an existing image, signaling deletion
    setValue('image_url', null); // This assumes 'image_url' is part of your form schema
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input element value
    }
  }, [name, setValue]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ fieldState }) => (
        <FormItem>
          <Label>{label}</Label>
          <div
            className={cn(
              "relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg h-48",
              "transition-colors duration-200",
              isDragOver ? "border-amber-500 bg-gray-700" : "border-gray-600 bg-gray-800",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileInput}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Product Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10 rounded-full h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering file input
                      handleRemoveImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  disabled={disabled}
                />
                <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-400 text-sm text-center">
                  Drag & drop an image here, or{' '}
                  <span className="text-amber-500 font-medium cursor-pointer">
                    click to select
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG, WEBP)</p>
                {/* Mobile specific options if needed, but click on div covers it */}
                {/* <div className="mt-4 md:hidden">
                  <Button type="button" size="sm" onClick={triggerFileInput} disabled={disabled}>
                    <Camera className="h-4 w-4 mr-2" /> Take Photo
                  </Button>
                  <Button type="button" size="sm" onClick={triggerFileInput} disabled={disabled}>
                    <Image className="h-4 w-4 mr-2" /> Choose Photo
                  </Button>
                </div> */}
              </>
            )}
          </div>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
