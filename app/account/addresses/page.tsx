"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MapPin, Plus, Edit2, Trash2, Star } from "lucide-react";
import { getAddresses, deleteAddress } from "@/lib/api/user.api";
import { useToast } from "@/hooks/use-toast";
import AddressModal from "@/components/AddressModal";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const { toast } = useToast();

  const loadAddresses = useCallback(async function() {
    try {
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (error: any) {
      toast({ title: "Error loading addresses", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  function handleAddAddress() {
    setEditingIndex(null);
    setEditingData(null);
    setModalOpen(true);
  }

  function handleEditAddress(index: number, address: any) {
    setEditingIndex(index);
    setEditingData({ ...address, index });
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingIndex(null);
    setEditingData(null);
  }

  function handleModalSaved() {
    loadAddresses();
  }

  async function handleDelete(index: number) {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddress(index);
      toast({ title: "Address deleted successfully" });
      loadAddresses();
    } catch (error: any) {
      toast({ title: "Error deleting address", description: error.message, variant: "destructive" });
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header - Premium */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent">
                My Addresses
              </h2>
              <p className="text-slate-600 mt-2">Manage your shipping addresses</p>
            </div>
            <button 
              onClick={handleAddAddress} 
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Plus className="w-5 h-5" />
              <span>Add Address</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 flex justify-center shadow-sm border border-slate-200">
              <GlobalLoader size="large" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <MapPin className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No addresses yet</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Add your shipping addresses to make checkout faster and easier.
              </p>
              <button 
                onClick={handleAddAddress} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-5 h-5" />
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {addresses.map((addr: any, idx: number) => (
                <div 
                  key={idx} 
                  className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                >
                  {/* Default Badge */}
                  {addr.isDefault && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Default</span>
                    </div>
                  )}

                  {/* Address Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{addr.name}</h3>
                      {addr.phone && (
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <span className="font-medium">📞</span> {addr.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-1.5 text-sm text-slate-600 mb-5 pl-15 bg-slate-50 p-4 rounded-xl">
                    <p className="font-medium text-slate-700">{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p className="font-medium">
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    {addr.country && <p className="text-slate-500">{addr.country}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-5 border-t border-slate-200">
                    <button 
                      onClick={() => handleEditAddress(idx, addr)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(idx)} 
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address Modal */}
        <AddressModal
          open={modalOpen}
          onClose={handleModalClose}
          onSaved={handleModalSaved}
          initialData={editingData}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
