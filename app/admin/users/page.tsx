"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAdminUsers } from "@/lib/admin";
import { Users, RefreshCw, Mail, Shield, User, UserCheck, Calendar } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers();
      setUsers(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      if (err.status === 401) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <AdminBadge variant="emerald">Admin</AdminBadge>;
      case "seller":
        return <AdminBadge variant="purple">Seller</AdminBadge>;
      default:
        return <AdminBadge variant="secondary">Customer</AdminBadge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "user",
      header: "User",
      accessor: (user: UserData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.name || "Unknown"}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      accessor: (user: UserData) => getRoleBadge(user.role),
    },
    {
      key: "status",
      header: "Status",
      accessor: (user: UserData) => (
        user.isVerified ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm">Verified</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <User className="w-4 h-4" />
            <span className="text-sm">Unverified</span>
          </span>
        )
      ),
    },
    {
      key: "joined",
      header: "Joined",
      accessor: (user: UserData) => (
        <span className="text-slate-600 flex items-center gap-1">
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatDate(user.createdAt)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <AdminLoadingState message="Loading users..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="Users"
        description={`${users.length} registered users`}
        actions={
          <button
            onClick={loadUsers}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      <AdminCard>
        {users.length === 0 ? (
          <AdminEmptyState
            icon={<Users className="w-12 h-12" />}
            title="No Users Found"
            description="No users have registered yet."
          />
        ) : (
          <AdminTable
            columns={columns}
            data={users}
            keyExtractor={(user) => user._id}
          />
        )}
      </AdminCard>
    </div>
  );
}
