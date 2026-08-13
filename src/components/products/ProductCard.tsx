// src/components/products/ProductCard.tsx
import React from 'react';
import Image from 'next/image';
import { Package, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ProductWithCategory } from '@/lib/types/models';
import { formatCurrency } from '@/lib/utils/helpers';
import ConfirmationDialog from '../common/ConfirmationDialog';

interface ProductCardProps {
  product: ProductWithCategory;
  onDelete: (productId: string) => void;
  isDeleting: boolean;
}

export default function ProductCard({ product, onDelete, isDeleting }: ProductCardProps) {
  const defaultBeerImage = '/default-beer.svg';
  const currency = 'GEL'; // Hardcoded for now

  return (
    <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Product Status Badge */}
      {!product.active && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
          INACTIVE
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-700 flex items-center justify-center p-2">
        <Image
          src={product.image_url || defaultBeerImage}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultBeerImage; // Fallback to default
          }}
        />
        {!product.image_url && <Package className="h-12 w-12 text-gray-500 absolute" />}
      </div>

      {/* Product Details */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-50 mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-amber-500 mb-2">
            {product.categories?.name || 'Uncategorized'}
          </p>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {product.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700">
          <span className="text-2xl font-bold text-white">
            {formatCurrency(Number(product.price), currency)}
          </span>
          <div className="flex space-x-2">
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="outline" size="sm" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                <Edit2 className="h-4 w-4 mr-2" /> Edit
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-800 border-gray-700 text-gray-200">
                <Link href={`/products/${product.id}/edit`}>
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-700">
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Product
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-gray-700" />
                <ConfirmationDialog
                  triggerText={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()} // Prevent closing dropdown immediately
                      className="cursor-pointer text-red-400 hover:bg-red-900 hover:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                    </DropdownMenuItem>
                  }
                  title="Are you absolutely sure?"
                  description="This action cannot be undone. This will permanently delete the product if it has no sales history. If sales exist, deletion will be prevented."
                  onConfirm={() => onDelete(product.id)}
                  confirmText={isDeleting ? 'Deleting...' : 'Yes, delete product'}
                  variant="destructive"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
