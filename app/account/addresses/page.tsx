"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MapPin, Plus } from "lucide-react";
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
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">My Addresses</h2>
              <p className="text-gray-600 mt-2">Manage your shipping addresses</p>
            </div>
            <button onClick={handleAddAddress} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Address</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg p-12 flex justify-center">
              <GlobalLoader size="large" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
              <p className="text-gray-600 mb-6">Add your shipping addresses to make checkout faster and easier.</p>
              <button onClick={handleAddAddress} className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map((addr: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{addr.name}</h3>
                    {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Default</span>}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                    {addr.country && <p>{addr.country}</p>}
                    <p>Phone: {addr.phone}</p>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleEditAddress(idx, addr)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(idx)} className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
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
