import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick: (product: Product) => void;
  onFavoriteToggle?: (productId: string) => void;
  onResetFilters?: () => void;
  onStartSelling?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onProductClick,
  onFavoriteToggle,
  onResetFilters,
  onStartSelling,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        type="products"
        title="No products available yet"
        description="New products will appear here as students start selling on CampusPlug."
        actionText="Be the first seller to list yours."
        onAction={onStartSelling || onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
};
