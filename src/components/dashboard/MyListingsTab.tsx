import React, { useState } from 'react';
import { Product, ProductStatus } from '../../types';
import { MarketService } from '../../services/marketService';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit3, Eye, Pause, Play, CheckCircle2, Trash2 } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface MyListingsTabProps {
  products: Product[];
  onRefresh: () => void;
  onEditProduct: (product: Product) => void;
  onOpenCreate: () => void;
}

export const MyListingsTab: React.FC<MyListingsTabProps> = ({
  products,
  onRefresh,
  onEditProduct,
  onOpenCreate,
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<ProductStatus | 'all'>('active');

  const filteredProducts =
    activeTab === 'all' ? products : products.filter((p) => p.status === activeTab);

  const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
    let ok = false;
    if (MarketService.enabled) {
      const res = await MarketService.updateListing(productId, { status: newStatus });
      if (res.success && res.data) { StorageService.upsertProductFromServer(res.data); ok = true; }
      else { error(res.message || 'Failed to update listing status.'); return; }
    } else {
      ok = !!StorageService.updateProduct(productId, { status: newStatus });
    }
    if (ok) {
      success(
        newStatus === 'sold'
          ? 'Item marked as Sold Out! Great job.'
          : newStatus === 'paused'
          ? 'Listing paused. It is now hidden from the marketplace.'
          : 'Listing resumed and is now active.'
      );
      onRefresh();
    } else {
      error('Failed to update listing status.');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    if (MarketService.enabled) {
      const res = await MarketService.deleteListing(productId);
      if (!res.success) { error(res.message || 'Failed to delete listing.'); return; }
      StorageService.removeProductFromCache(productId);
      success('Listing deleted.');
      onRefresh();
      return;
    }
    if (StorageService.deleteProduct(productId)) {
      success('Listing deleted.');
      onRefresh();
    } else {
      error('Failed to delete listing.');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({products.filter((p) => p.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sold'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sold ({products.filter((p) => p.status === 'sold').length})
          </button>
          <button
            onClick={() => setActiveTab('paused')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'paused'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paused ({products.filter((p) => p.status === 'paused').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({products.length})
          </button>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Sell New Item
        </button>
      </div>

      {/* Listings List */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          type="products"
          title={`No ${activeTab !== 'all' ? activeTab : ''} listings found`}
          description="You don't have any items in this category right now."
          actionText="Sell Something"
          onAction={onOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const primaryImg =
              product.images?.[0] ||
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex gap-4 items-start justify-between relative overflow-hidden"
              >
                {/* Left Thumbnail */}
                <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative border border-slate-100">
                  <img
                    src={primaryImg}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {product.status === 'sold' && (
                    <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
                      <span className="text-[9px] font-black uppercase text-white tracking-wider">Sold</span>
                    </div>
                  )}
                  {product.status === 'paused' && (
                    <div className="absolute inset-0 bg-amber-900/60 flex items-center justify-center">
                      <span className="text-[9px] font-black uppercase text-white tracking-wider">Paused</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-emerald-700">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {product.views} views
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                    {product.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {product.categoryName} • {product.condition} • {product.sellerCampus}
                  </p>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>

                    {product.status === 'active' ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(product.id, 'sold')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Mark Sold
                        </button>
                        <button
                          onClick={() => handleStatusChange(product.id, 'paused')}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Pause className="w-3 h-3" /> Pause
                        </button>
                      </>
                    ) : product.status === 'paused' ? (
                      <button
                        onClick={() => handleStatusChange(product.id, 'active')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" /> Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(product.id, 'active')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        Re-list
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
