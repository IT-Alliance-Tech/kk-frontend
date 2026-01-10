'use client';

import { useState } from 'react';
import { X, Plus, Star } from 'lucide-react';

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
      <div className="space-y-2">
        {sizes.map((size, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              size.isDefault ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{size.name}</span>
                  {size.isDefault && (
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                      <Star size={12} fill="currentColor" />
                      Default
                    </span>
                  )}
                  {!size.isActive && (
                    <span className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <div>
                    <span className="font-medium">Selling Price:</span> ₹{size.price.toFixed(2)} | 
                    <span className="font-medium ml-2">MRP:</span> ₹{size.mrp.toFixed(2)} | 
                    <span className="font-medium ml-2">Stock:</span> {size.stock}
                  </div>
                  {size.sku && (
                    <div className="text-xs text-gray-500">SKU: {size.sku}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!size.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(index)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 border border-emerald-300 rounded hover:bg-emerald-50"
                  >
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sizes.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="mb-2">No sizes added yet</p>
            <p className="text-sm">Click "Add Size" below to create your first size option</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {editingIndex !== null && (
        <div className="border-2 border-emerald-500 rounded-lg p-4 bg-emerald-50">
          <h4 className="font-semibold text-gray-900 mb-3">
            {editingIndex < sizes.length ? 'Edit Size' : 'Add New Size'}
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Size / Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 26 cm – 3.5 Litres, Small, Medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                MRP (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SKU <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional product code"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="mr-2 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium flex items-center gap-1">
                  <Star size={14} className="text-emerald-600" />
                  Set as Default Size
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Available for Sale</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleSave}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium"
            >
              {editingIndex < sizes.length ? 'Update Size' : 'Add Size'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {editingIndex === null && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
        >
          <Plus size={20} />
          <span className="font-medium">Add Size</span>
        </button>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
