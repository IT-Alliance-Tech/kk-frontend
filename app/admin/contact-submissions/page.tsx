/**
 * Admin Contact Submissions Page - Redesigned
 * Modern contact form submission management
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminContactSubmissions } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { Mail, Phone, MessageSquare, Calendar, User, Tag, X, ExternalLink } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable, TableActionMenu, TableActionButton } from "@/components/admin/ui/AdminTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";
import { AdminModal } from "@/components/admin/ui/AdminModal";

interface ContactSubmission {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  subject?: string;
  message?: string;
  source: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const router = useRouter();

  const loadSubmissions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminContactSubmissions({ page, limit: 10 });
      
      if (response && response.submissions) {
        setSubmissions(response.submissions || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      console.error("Failed to load contact submissions:", err);
      setError(err.message || "Failed to load contact submissions");
      
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSubmissions(1);
  }, [loadSubmissions]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || loading) return;
    loadSubmissions(newPage);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Table columns
  const columns = [
    {
      key: "date",
      header: "Date",
      render: (submission: ContactSubmission) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="whitespace-nowrap">{formatDate(submission.createdAt)}</span>
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (submission: ContactSubmission) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-medium text-slate-900">{submission.name}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (submission: ContactSubmission) => (
        <div className="space-y-1">
          <a 
            href={`mailto:${submission.email}`}
            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Mail className="w-3.5 h-3.5" />
            {submission.email}
          </a>
          <a 
            href={`tel:${submission.mobile}`}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <Phone className="w-3.5 h-3.5" />
            {submission.mobile}
          </a>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      className: "hidden lg:table-cell",
      render: (submission: ContactSubmission) => (
        <span className="text-sm text-slate-700">
          {submission.subject || <span className="text-slate-400">-</span>}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (submission: ContactSubmission) => (
        <AdminBadge variant="emerald" className="flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {submission.source}
        </AdminBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[80px]",
      render: (submission: ContactSubmission) => (
        <TableActionMenu>
          <TableActionButton
            onClick={() => setSelectedSubmission(submission)}
            icon={<MessageSquare className="w-4 h-4" />}
            label="View Message"
          />
          <TableActionButton
            onClick={() => window.location.href = `mailto:${submission.email}`}
            icon={<Mail className="w-4 h-4" />}
            label="Send Email"
          />
        </TableActionMenu>
      ),
    },
  ];

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <AdminLoadingState fullPage message="Loading submissions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Contact Submissions"
        description="View messages from the contact form"
        badge={
          <AdminBadge variant="secondary" size="lg">
            {pagination.total} messages
          </AdminBadge>
        }
      />

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Submissions Table */}
      <AdminCard padding="none">
        {submissions.length === 0 && !loading ? (
          <AdminEmptyState
            type="no-data"
            title="No submissions yet"
            description="Contact form submissions will appear here."
          />
        ) : (
          <>
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <AdminLoadingState />
                </div>
              )}
              <AdminTable
                columns={columns}
                data={submissions}
                keyExtractor={(submission) => submission._id}
                onRowClick={(submission) => setSelectedSubmission(submission)}
              />
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-slate-200 px-4 py-3">
                <AdminPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </AdminCard>

      {/* Message Detail Modal */}
      <AdminModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title="Contact Message"
        description={selectedSubmission ? formatDate(selectedSubmission.createdAt) : ""}
        size="md"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Name</span>
                </div>
                <p className="font-medium text-slate-900">{selectedSubmission.name}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Source</span>
                </div>
                <AdminBadge variant="emerald">{selectedSubmission.source}</AdminBadge>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <a 
                href={`mailto:${selectedSubmission.email}`}
                className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700">{selectedSubmission.email}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-500" />
              </a>
              <a 
                href={`tel:${selectedSubmission.mobile}`}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">{selectedSubmission.mobile}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Subject */}
            {selectedSubmission.subject && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Subject</h4>
                <p className="text-slate-900">{selectedSubmission.subject}</p>
              </div>
            )}

            {/* Message */}
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Message</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap">
                  {selectedSubmission.message || <span className="text-slate-400 italic">No message provided</span>}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${selectedSubmission.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
