'use client';

import { useState } from 'react';
import { X, Plus, Star, Edit3, Trash2, Package, DollarSign, Archive, Hash, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Size {
  _id?: string;
  name: string;
  sku?: string;
  price: number;
  mrp: number;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
}

interface InlineSizeManagerProps {
  sizes: Size[];
  onChange: (sizes: Size[]) => void;
  errors?: string[];
}

export default function InlineSizeManager({ sizes, onChange, errors = [] }: InlineSizeManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Size>({
    name: '',
    price: 0,
    mrp: 0,
    stock: 0,
    isDefault: false,
    isActive: true,
  });

  const handleAdd = () => {
    setEditingIndex(sizes.length);
    setFormData({
      name: '',
      price: 0,
      mrp: 0,
      stock: 0,
      isDefault: sizes.length === 0, // First size is default by default
      isActive: true,
    });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData({ ...sizes[index] });
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Size name is required');
      return;
    }
    if (formData.price <= 0 || formData.mrp <= 0) {
      alert('Price and MRP must be greater than 0');
      return;
    }
    if (formData.price > formData.mrp) {
      alert('Price cannot be greater than MRP');
      return;
    }

    const newSizes = [...sizes];
    
    // If setting this as default, unset others
    if (formData.isDefault) {
      newSizes.forEach(s => s.isDefault = false);
    }

    if (editingIndex !== null && editingIndex < sizes.length) {
      // Update existing
      newSizes[editingIndex] = formData;
    } else {
      // Add new
      newSizes.push(formData);
    }

    onChange(newSizes);
    setEditingIndex(null);
    setFormData({
      name: '',
      price: 0,
      mrp: 0,
      stock: 0,
      isDefault: false,
      isActive: true,
    });
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData({
      name: '',
      price: 0,
      mrp: 0,
      stock: 0,
      isDefault: false,
      isActive: true,
    });
  };

  const handleDelete = (index: number) => {
    if (sizes[index].isDefault && sizes.length > 1) {
      alert('Cannot delete the default size. Please mark another size as default first.');
      return;
    }
    if (confirm('Are you sure you want to remove this size?')) {
      const newSizes = sizes.filter((_, i) => i !== index);
      // If we deleted the only size or the default, make the first one default
      if (newSizes.length > 0 && !newSizes.some(s => s.isDefault)) {
        newSizes[0].isDefault = true;
      }
      onChange(newSizes);
    }
  };

  const handleSetDefault = (index: number) => {
    const newSizes = sizes.map((s, i) => ({
      ...s,
      isDefault: i === index
    }));
    onChange(newSizes);
  };

  return (
    <div className="space-y-4">
      {/* Size List */}
      <div className="grid grid-cols-1 gap-3">
        {sizes.map((size, index) => (
          <div
            key={index}
            className={`relative rounded-xl border-2 transition-all ${
              size.isDefault 
                ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-white shadow-sm' 
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {/* Default badge ribbon */}
            {size.isDefault && (
              <div className="absolute -top-px -right-px">
                <div className="bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  Default
                </div>
              </div>
            )}
            
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Size Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <h4 className="font-semibold text-slate-900 truncate">{size.name}</h4>
                    {!size.isActive && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                        <XCircle size={10} />
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  {/* Price/Stock Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                        <DollarSign size={10} />
                        Selling Price
                      </div>
                      <div className="font-semibold text-slate-900">₹{size.price.toFixed(2)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                        <DollarSign size={10} />
                        MRP
                      </div>
                      <div className="font-semibold text-slate-900">₹{size.mrp.toFixed(2)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                        <Archive size={10} />
                        Stock
                      </div>
                      <div className={`font-semibold ${size.stock > 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        {size.stock}
                      </div>
                    </div>
                    {size.sku && (
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                          <Hash size={10} />
                          SKU
                        </div>
                        <div className="font-mono text-sm text-slate-700 truncate">{size.sku}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  {!size.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(index)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <Star size={12} />
                      Set Default
                    </button>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="inline-flex items-center justify-center p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete size"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {sizes.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-slate-400" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">No sizes added yet</h4>
            <p className="text-sm text-slate-500">Click &quot;Add Size&quot; below to create your first size option</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {editingIndex !== null && (
        <div className="border-2 border-emerald-500 rounded-xl overflow-hidden bg-white shadow-lg">
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <h4 className="font-semibold text-white flex items-center gap-2">
              {editingIndex < sizes.length ? (
                <>
                  <Edit3 size={18} />
                  Edit Size
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add New Size
                </>
              )}
            </h4>
          </div>
          
          <div className="p-5 space-y-5">
            {/* Size Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Size / Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                placeholder="e.g., 26 cm – 3.5 Litres, Small, Medium"
              />
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  MRP (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Stock & SKU Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SKU <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                  placeholder="Optional product code"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors flex-1">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Set as Default Size</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors flex-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Available for Sale</span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
              >
                <CheckCircle size={16} />
                {editingIndex < sizes.length ? 'Update Size' : 'Add Size'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      {editingIndex === null && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-4 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-slate-500 group-hover:text-emerald-600" />
          </div>
          <span className="font-medium">Add Size</span>
        </button>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
